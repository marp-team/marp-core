import type { Root } from 'postcss'
import postcssSelectorParser from 'postcss-selector-parser'
import { elements } from './definitions'

export const customElementsPostCSSPlugin = (root: Root) => {
  const targetElements = Object.keys(elements)

  root.walkRules(new RegExp(targetElements.join('|'), 'i'), (rule) => {
    postcssSelectorParser((selectorRoot) => {
      selectorRoot.walkTags((tag) => {
        const normalizedTagName = tag.value.toLowerCase()

        if (targetElements.includes(normalizedTagName)) {
          tag.value = `:is(${normalizedTagName}, marp-${normalizedTagName})`
        }
      })
    }).processSync(rule, { updateSelector: true })
  })
}
