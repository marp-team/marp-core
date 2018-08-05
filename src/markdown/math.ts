import katex from 'katex'
import markdownItKatex from 'markdown-it-katex'
import postcss from 'postcss'
import katexScss from './katex.scss'

export function markdownItPlugin(
  md,
  katexOptions: object,
  updateRendered: (isRendered: boolean) => void
) {
  const opts = mergeOpts => ({
    throwOnError: true,
    ...katexOptions,
    ...mergeOpts,
  })

  md.core.ruler.before('block', 'marp_math_initialize', state => {
    if (!state.inlineMode) updateRendered(false)
  })

  // Parse math syntax by using markdown-it-katex
  md.use(markdownItKatex)

  const mathInline =
    md.inline.ruler.__rules__[md.inline.ruler.__find__('math_inline')].fn

  const mathBlock =
    md.block.ruler.__rules__[md.block.ruler.__find__('math_block')].fn

  md.inline.ruler.at('math_inline', (...args) => {
    const ret = mathInline(...args)
    if (ret) updateRendered(true)

    return ret
  })

  md.block.ruler.at('math_block', (...args) => {
    const ret = mathBlock(...args)
    if (ret) updateRendered(true)

    return ret
  })

  // Swap renderer to use the latest KaTeX
  md.renderer.rules.math_inline = (tokens, idx) => {
    const { content } = tokens[idx]
    try {
      const math = katex.renderToString(content, opts({ displayMode: false }))
      return math
    } catch (e) {
      console.warn(e)
      return content
    }
  }

  md.renderer.rules.math_block = (tokens, idx) => {
    const { content } = tokens[idx]
    try {
      const math = `<p>${katex.renderToString(
        content,
        opts({ displayMode: true })
      )}</p>`
      return math
    } catch (e) {
      console.warn(e)
      return `<p>${content}</p>`
    }
  }
}

const katexDefaultFontPath = 'fonts/'

const katexFontPath = path => {
  const pattern = `url\\(['"]?${katexDefaultFontPath}(.*?)['"]?\\)`
  const matcher = new RegExp(pattern, 'g')

  return postcss.plugin('marp-math-katex-font-path', () => css => {
    css.walkAtRules('font-face', rule => {
      rule.walkDecls('src', decl => {
        decl.value = decl.value.replace(
          matcher,
          (matched, matchedPath) => `url('${path}${matchedPath}')`
        )
      })
    })
  })
}

const convertedCSS = {}

export function css(path?: string): string {
  if (!path) return katexScss

  convertedCSS[path] =
    convertedCSS[path] || postcss([katexFontPath(path)]).process(katexScss).css

  return convertedCSS[path]
}
