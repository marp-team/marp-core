import { plugin as postCSSplugin } from 'postcss'

const defaultThemeMatcher = /@theme +default/

const plugin = postCSSplugin('postcss-optimize-default-theme', () => (css) => {
  if (!defaultThemeMatcher.test(css.source.input.css)) return

  // Remove rules for .markdown-body selector
  css.walkRules((rule) => {
    const ss = rule.selectors.filter((s) => !s.startsWith('.markdown-body'))

    if (ss.length > 0) {
      rule.selectors = ss
    } else {
      rule.remove()
    }
  })
})

export default plugin
