import katex from 'katex'
import markdownItKatex from 'markdown-it-katex'
import postcss from 'postcss'
import katexScss from './katex.scss'

export function markdownItPlugin(md, katexOptions: object) {
  const opts = (mergeOpts = {}) => ({
    throwOnError: false,
    ...katexOptions,
    ...mergeOpts,
  })

  // Parse math syntax by using markdown-it-katex
  md.use(markdownItKatex)

  // Swap renderer to use the latest KaTeX
  md.renderer.rules.math_inline = (tokens, idx) => {
    const { content } = tokens[idx]
    try {
      return katex.renderToString(content, opts({ displayMode: false }))
    } catch (e) {
      console.warn(e)
      return content
    }
  }

  md.renderer.rules.math_block = (tokens, idx) => {
    const { content } = tokens[idx]
    try {
      return `<p>${katex.renderToString(
        content,
        opts({ displayMode: true })
      )}</p>`
    } catch (e) {
      console.warn(e)
      return `<p>${content}</p>`
    }
  }
}

const katexDefaultFontPath = 'fonts/'

const katexFontPath = (path = katexDefaultFontPath) => {
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
