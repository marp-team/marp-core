import postcssSelectorParser from 'postcss-selector-parser'

const defaultThemeMatcher = /@theme +default/
const colorThemeMatcher = /prefers-color-scheme:\s+(light|dark)/i

/** @return {import('postcss').Plugin} */
export const postcssOptimizeDefaultTheme = () => {
  let shouldProcess = false
  let colors

  return {
    postcssPlugin: 'postcss-optimize-default-theme',
    Once: (css) => {
      colors = {
        light: { atRule: null, declarations: new Map() },
        dark: { atRule: null, declarations: new Map() },
      }
      shouldProcess = defaultThemeMatcher.test(css.source.input.css)
    },
    OnceExit: (css) => {
      if (!shouldProcess) return

      const decls = new Set([
        ...colors.light.declarations.keys(),
        ...colors.dark.declarations.keys(),
      ])

      const mergedColorRule = {
        selector: 'section',
        nodes: Array.from(decls).map((prop) => ({
          prop,
          value: `light-dark(${colors.light.declarations.get(prop) || ''}, ${
            colors.dark.declarations.get(prop) || ''
          })`,
        })),
      }

      css.prepend(mergedColorRule)
      const mergedColorRuleNode = css.first

      // Remove fallback declarations that would override the merged light-dark() vars
      css.walkDecls(/^--./, (decl) => {
        if (
          decl.parent !== mergedColorRuleNode &&
          decls.has(decl.prop)
        ) {
          decl.remove()
        }
      })
    },
    AtRule: {
      media: (rule) => {
        if (!shouldProcess) return

        const matched = rule.params.match(colorThemeMatcher)

        if (matched) {
          rule.walkDecls(/^--./, (decl) => {
            colors[matched[1].toLowerCase()].declarations.set(
              decl.prop,
              decl.value,
            )
            decl.remove()
          })

          if (matched[1] === 'dark') {
            rule.walkRules((rule) => {
              postcssSelectorParser((selectorRoot) => {
                selectorRoot.walkTags((tag) => {
                  const normalizedTagName = tag.value.toLowerCase()

                  if (normalizedTagName === 'section') {
                    tag.parent.insertAfter(
                      tag,
                      postcssSelectorParser.pseudo({
                        value: ':where(.invert)',
                      }),
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

postcssOptimizeDefaultTheme.postcss = true
