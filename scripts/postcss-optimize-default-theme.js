const defaultThemeMatcher = /@theme +default/

const plugin = () => {
  let shouldProcess = false

  return {
    postcssPlugin: 'postcss-optimize-default-theme',
    Once: (css) => {
      shouldProcess = defaultThemeMatcher.test(css.source.input.css)
    },
    Rule(rule) {
      if (!shouldProcess) return

      const ss = rule.selectors.filter((s) => !s.startsWith('.markdown-body'))

      if (ss.length > 0) {
        rule.selectors = ss
      } else {
        rule.remove()
      }
    },
  }
}

plugin.postcss = true

export default plugin
