import type { PluginCreator, Plugin } from 'postcss'
import postcssSelectorParser, { type Container } from 'postcss-selector-parser'
import { elements } from './definitions'

const targetElements = Object.keys(elements)

const findClosest = (
  container: Container | undefined,
  finder: (container: Container) => boolean,
) => {
  let current: Container | undefined = container

  while (current) {
    if (finder(current)) return current
    current = current.parent
  }

  return undefined
}

export const customElementsPostCSSPlugin: PluginCreator<never> = Object.assign(
  (): Plugin => ({
    postcssPlugin: 'marp-core-custom-elements',
    Root: (root) => {
      root.walkRules(new RegExp(targetElements.join('|'), 'i'), (rule) => {
        postcssSelectorParser((selectorRoot) => {
          selectorRoot.walkTags((tag) => {
            const normalizedTagName = tag.value.toLowerCase()

            if (targetElements.includes(normalizedTagName)) {
              // Check if there is inside of a valid pseudo element
              const closestPseudo = findClosest(
                tag.parent,
                ({ type }) => type === 'pseudo',
              )
              if (closestPseudo?.value === '::part') return

              // Replace
              tag.value = `:is(${normalizedTagName}, marp-${normalizedTagName})`
            }
          })
        }).processSync(rule, { updateSelector: true })
      })
    },
  }),
  { postcss: true as const },
)
