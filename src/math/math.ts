import marpitPlugin from '@marp-team/marpit/plugin'
import katex from 'katex'
import katexScss from './katex.scss'

const convertedCSS = {}
const katexMatcher = /url\(['"]?fonts\/(.*?)['"]?\)/g

interface MathOptionsInterface {
  katexOption?: object
  katexFontPath?: string | false
}

export type MathOptions = boolean | MathOptionsInterface

/**
 * marp-core math plugin
 *
 * It is implemented based on markdown-it-katex plugin. However, that is no
 * longer maintained by author. So we have ported math typesetting parser.
 *
 * @see https://github.com/waylonflinn/markdown-it-katex
 */
export const markdown = marpitPlugin(
  (md, updateState: (rendered: boolean) => void = () => {}) => {
    const genOpts = (displayMode: boolean) => {
      const math: MathOptions = md.marpit.options.math

      return {
        throwOnError: false,
        ...(typeof math === 'object' && typeof math.katexOption === 'object'
          ? math.katexOption
          : {}),
        displayMode,
      }
    }

    md.core.ruler.before('block', 'marp_math_initialize', state => {
      if (state.inlineMode) return

      updateState(false)

      if (md.marpit.options.math) {
        md.block.ruler.enable('marp_math_block')
        md.inline.ruler.enable('marp_math_inline')
      } else {
        md.block.ruler.disable('marp_math_block')
        md.inline.ruler.disable('marp_math_inline')
      }
    })

    // Inline
    md.inline.ruler.after('escape', 'marp_math_inline', (state, silent) => {
      if (parseInlineMath(state, silent)) {
        updateState(true)
        return true
      }
      return false
    })

    md.renderer.rules.marp_math_inline = (tokens, idx) => {
      const { content } = tokens[idx]

      try {
        return katex.renderToString(content, genOpts(false))
      } catch (e) {
        console.warn(e)
        return content
      }
    }

    // Block
    md.block.ruler.after(
      'blockquote',
      'marp_math_block',
      (state, start, end, silent) => {
        if (parseMathBlock(state, start, end, silent)) {
          updateState(true)
          return true
        }
        return false
      },
      { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
    )

    md.renderer.rules.marp_math_block = (tokens, idx) => {
      const { content } = tokens[idx]

      try {
        return `<p>${katex.renderToString(content, genOpts(true))}</p>`
      } catch (e) {
        console.warn(e)
        return `<p>${content}</p>`
      }
    }
  }
)

export function css(path?: string): string {
  if (!path) return katexScss

  return (convertedCSS[path] =
    convertedCSS[path] ||
    katexScss.replace(katexMatcher, (_, matched) => `url('${path}${matched}')`))
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
