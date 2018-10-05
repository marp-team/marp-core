import katex from 'katex'
import markdownItKatex from 'markdown-it-katex'
import postcss from 'postcss'
import katexScss from './katex.scss'

const convertedCSS = {}
const katexMatcher = /url\(['"]?fonts\/(.*?)['"]?\)/g
const rules = { math_block: 'block', math_inline: 'inline' }

export function css(path?: string): string {
  if (!path) return katexScss

  return (convertedCSS[path] =
    convertedCSS[path] ||
    postcss([
      postcss.plugin('marp-math-katex-font-path', () => css =>
        css.walkAtRules('font-face', rule =>
          rule.walkDecls('src', decl => {
            decl.value = decl.value.replace(
              katexMatcher,
              (_, matched) => `url('${path}${matched}')`
            )
          })
        )
      ),
    ]).process(katexScss).css)
}

export function markdown(md, opts: {}, update: (to: boolean) => void): void {
  const genOpts = (displayMode: boolean) => ({
    throwOnError: false,
    ...opts,
    displayMode,
  })

  md.core.ruler.before('block', 'marp_math_initialize', state => {
    if (!state.inlineMode) update(false)
  })

  // Parse math syntax by using markdown-it-katex
  md.use(markdownItKatex)

  for (const rule of Object.keys(rules)) {
    const kind = rules[rule]
    const original = md[kind].ruler.__rules__[md[kind].ruler.__find__(rule)].fn

    md[kind].ruler.at(rule, (...args) => {
      const ret = original(...args)
      if (ret) update(true)

      return ret
    })
  }

  // Swap renderer to use the latest KaTeX
  md.renderer.rules.math_inline = (tokens, idx) => {
    const { content } = tokens[idx]

    try {
      return katex.renderToString(content, genOpts(false))
    } catch (e) {
      console.warn(e)
      return content
    }
  }

  md.renderer.rules.math_block = (tokens, idx) => {
    const { content } = tokens[idx]

    try {
      return `<p>${katex.renderToString(content, genOpts(true))}</p>`
    } catch (e) {
      console.warn(e)
      return `<p>${content}</p>`
    }
  }
}
