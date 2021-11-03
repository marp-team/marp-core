const postcssSelectorParser = require('postcss-selector-parser')

const defaultThemeMatcher = /@theme +default/
const colorThemeMatcher = /prefers-color-scheme:\s+(light|dark)/i

const plugin = () => {
  let shouldProcess = false

  return {
    postcssPlugin: 'postcss-optimize-default-theme',
    Once: (css) => {
      shouldProcess = defaultThemeMatcher.test(css.source.input.css)
    },
    AtRule: {
      media: (rule) => {
        if (!shouldProcess) return

        const matched = rule.params.match(colorThemeMatcher)

        if (matched) {
          if (matched[1] === 'dark') {
            rule.walkRules((rule) => {
              postcssSelectorParser((selectorRoot) => {
                selectorRoot.walkTags((tag) => {
                  const normalizedTagName = tag.value.toLowerCase()

                  if (normalizedTagName === 'section') {
                    tag.parent.insertAfter(
                      tag,
                      postcssSelectorParser.pseudo({ value: ':where(.invert)' })
                    )
                  }
                })
              }).processSync(rule, { updateSelector: true })
            })

            // Append a rule of dark theme after the light theme
            rule.next().after(rule.nodes)
          }
          rule.replaceWith(rule.nodes)
        }
      },
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
