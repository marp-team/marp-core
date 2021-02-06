import marpitPlugin from '@marp-team/marpit/plugin'
import { getMathContext, setMathContext } from './context'
import * as katex from './katex'
import * as mathjax from './mathjax'

export interface MathOptionsInterface {
  lib?: 'katex' | 'mathjax'
  katexOption?: Record<string, unknown>
  katexFontPath?: string | false
}

export type MathOptions =
  | boolean
  | MathOptionsInterface['lib']
  | MathOptionsInterface

export const markdown = marpitPlugin((md) => {
  const opts: MathOptions | undefined = md.marpit.options.math
  if (!opts) return

  const parsedOpts =
    typeof opts !== 'object'
      ? { lib: typeof opts === 'string' ? opts : undefined }
      : opts

  // Initialize
  const { parse, parseInline } = md

  const initializeMathContext = () =>
    setMathContext(md.marpit, () => ({
      enabled: false,
      options: parsedOpts,
      katexMacroContext: {
        ...((parsedOpts.katexOption?.macros as any) || {}),
      },
      mathjaxContext: null,
    }))

  md.parse = function (...args) {
    initializeMathContext()
    return parse.apply(this, args)
  }

  md.parseInline = function (...args) {
    initializeMathContext()
    return parseInline.apply(this, args)
  }

  const enableMath = () =>
    setMathContext(md.marpit, (ctx) => ({ ...ctx, enabled: true }))

  // Inline
  md.inline.ruler.after('escape', 'marp_math_inline', (state, silent) => {
    const ret = parseInlineMath(state, silent)
    if (ret) enableMath()

    return ret
  })

  // Block
  md.block.ruler.after(
    'blockquote',
    'marp_math_block',
    (state, start, end, silent) => {
      const ret = parseMathBlock(state, start, end, silent)
      if (ret) enableMath()

      return ret
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  )

  // Renderer
  if (parsedOpts.lib === 'mathjax') {
    md.renderer.rules.marp_math_inline = mathjax.inline(md.marpit)
    md.renderer.rules.marp_math_block = mathjax.block(md.marpit)
  } else {
    md.renderer.rules.marp_math_inline = katex.inline(md.marpit)
    md.renderer.rules.marp_math_block = katex.block(md.marpit)
  }
})

export const css = (marpit: any): string | null => {
  const { enabled, options } = getMathContext(marpit)
  if (!enabled) return null

  if (options.lib === 'mathjax') return mathjax.css(marpit)

  return katex.css(options.katexFontPath)
}

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
  for (; !found; ) {
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
