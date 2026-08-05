import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import type { Marp } from '../marp'
import { marpPlugin } from '../plugin'
import { getMathContext, setMathContext, getMathLibrary } from './context'
import type { MathOptions, MathLibrary } from './options'
import { normalizeMathOptions } from './options'

export type { MathOptions }

export const markdown = marpPlugin((md) => {
  const { marpit: marp } = md

  const opts = normalizeMathOptions(marp.options.math)
  if (!opts) return

  // Define `math` global directive to choose preferred library
  Object.defineProperty(marp.customDirectives.global, 'math', {
    value: (math: unknown): { math?: string } =>
      typeof math === 'string' && getMathLibrary(marp, math) ? { math } : {},
  })

  // Initialize
  const { parse, parseInline } = md

  const initializeMathContext = () => {
    if (getMathContext(marp).processing) return false

    setMathContext(marp, (ctx) => ({
      libs: Object.fromEntries(
        Object.entries(ctx.libs).map(([name, lib]) => [
          name,
          { ...lib, context: lib.initializeContext?.(marp) },
        ]),
      ),
      enabled: false,
      options: opts,
      processing: true,
    }))

    return true
  }

  const parseWithMath = <F extends (this: any, ...args: any[]) => any>(
    func: F,
  ) => {
    return function (this: ThisType<F>, ...args: Parameters<F>) {
      const initialized = initializeMathContext()

      try {
        return func.apply(this, args)
      } finally {
        if (initialized) {
          setMathContext(marp, (ctx) => ({ ...ctx, processing: false }))
        }
      }
    }
  }

  md.parse = parseWithMath(parse)
  md.parseInline = parseWithMath(parseInline)

  const enableMath = () =>
    setMathContext(marp, (ctx) => ({ ...ctx, enabled: true }))

  const hasMathLibrary = () => Object.keys(getMathContext(marp).libs).length > 0

  // Inline
  md.inline.ruler.after('escape', 'marp_math_inline', (state, silent) => {
    if (!hasMathLibrary()) return false

    const ret = parseInlineMath(state, silent)
    if (ret) enableMath()

    return ret
  })

  // Block
  md.block.ruler.after(
    'blockquote',
    'marp_math_block',
    (state, start, end, silent) => {
      if (!hasMathLibrary()) return false

      const ret = parseMathBlock(state, start, end, silent)
      if (ret) enableMath()

      return ret
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  )

  // Renderer
  md.core.ruler.after(
    'marpit_directives_global_parse',
    'marp_math_directive',
    () => {
      const { enabled } = getMathContext(marp)
      if (!enabled) return

      const preferred: MathLibrary | undefined =
        (marp as any).lastGlobalDirectives.math ?? opts.lib

      setMathContext(marp, (ctx) => ({
        ...ctx,
        options: {
          ...ctx.options,
          lib:
            preferred && ctx.libs[preferred]
              ? preferred
              : Object.keys(ctx.libs)[0],
        },
      }))
    },
  )

  const getRenderer =
    (type: 'blockRenderer' | 'inlineRenderer'): RenderRule =>
    (tokens, idx, ...rest) => {
      const lib = getMathLibrary(marp)

      if (!lib) {
        const token = tokens[idx]
        const escaped = md.utils.escapeHtml(
          `${token.markup}${token.content}${token.markup}`,
        )
        return token.block ? `<p>${escaped}</p>` : escaped
      }

      return lib[type](marp)(tokens, idx, ...rest)
    }

  md.renderer.rules.marp_math_inline = getRenderer('inlineRenderer')
  md.renderer.rules.marp_math_block = getRenderer('blockRenderer')
})

export const css = (marp: Marp): string | null => {
  const { enabled } = getMathContext(marp)
  if (!enabled) return null

  const lib = getMathLibrary(marp)
  if (!lib) return null

  return lib.css(marp)
}

// ---

function isValidDelim(state, pos = state.pos) {
  const ret = { openable: true, closable: true }
  const { posMax, src } = state
  const prev = pos > 0 ? src.charCodeAt(pos - 1) : -1
  const next = pos + 1 <= posMax ? src.charCodeAt(pos + 1) : -1

  if (next === 0x20 || next === 0x09) ret.openable = false
  if (prev === 0x20 || prev === 0x09 || (next >= 0x30 && next <= 0x39)) {
    ret.closable = false
  }

  return ret
}

function parseInlineMath(state, silent) {
  const { src, pos } = state
  if (src[pos] !== '$') return false

  const addPending = (stt: string) => (state.pending += stt)
  const found = (manipulation: () => void, newPos: number) => {
    if (!silent) manipulation()
    state.pos = newPos
    return true
  }

  const start = pos + 1
  if (!isValidDelim(state).openable) return found(() => addPending('$'), start)

  let match = start
  while ((match = src.indexOf('$', match)) !== -1) {
    let dollarPos = match - 1
    while (src[dollarPos] === '\\') dollarPos -= 1

    if ((match - dollarPos) % 2 === 1) break
    match += 1
  }

  if (match === -1) return found(() => addPending('$'), start)
  if (match - start === 0) return found(() => addPending('$$'), start + 1)
  if (!isValidDelim(state, match).closable) {
    return found(() => addPending('$'), start)
  }

  return found(() => {
    const token = state.push('marp_math_inline', 'math', 0)
    token.markup = '$'
    token.content = src.slice(start, match)
  }, match + 1)
}

function parseMathBlock(state, start, end, silent) {
  const { blkIndent, bMarks, eMarks, src, tShift } = state
  let pos = bMarks[start] + tShift[start]
  let max = eMarks[start]

  if (pos + 2 > max || src.slice(pos, pos + 2) !== '$$') return false
  if (silent) return true

  pos += 2

  let firstLine = src.slice(pos, max)
  let lastLine
  let found = firstLine.trim().slice(-2) === '$$'

  if (found) firstLine = firstLine.trim().slice(0, -2)

  let next = start
  for (; !found;) {
    next += 1
    if (next >= end) break

    pos = bMarks[next] + tShift[next]
    max = eMarks[next]
    if (pos < max && tShift[next] < blkIndent) break

    const target = src.slice(pos, max).trim()

    if (target.slice(-2) === '$$') {
      found = true
      lastLine = src.slice(pos, src.slice(0, max).lastIndexOf('$$'))
    }
  }

  state.line = next + 1

  const token = state.push('marp_math_block', 'math', 0)
  token.block = true
  token.content = ''
  token.map = [start, state.line]
  token.markup = '$$'

  if (firstLine?.trim()) token.content += `${firstLine}\n`
  token.content += state.getLines(start + 1, next, tShift[start], true)
  if (lastLine?.trim()) token.content += lastLine

  return true
}
