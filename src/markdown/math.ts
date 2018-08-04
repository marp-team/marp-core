import katex from 'katex'
import markdownItKatex from 'markdown-it-katex'
import katexScss from './katex.scss'

export function markdownItPlugin(md, katexOptions: object) {
  const opts = (mergeOpts = {}) => ({
    ...katexOptions,
    ...mergeOpts,
    throwOnError: true,
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

export function css() {
  // TODO: Manipulate with PostCSS to change URL of KaTeX fonts
  return katexScss
}
