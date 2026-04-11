import { elements } from '../definitions'
import { MarpAutoScaling } from './marp-auto-scaling'
import { createMarpCustomElement } from './marp-custom-element'
import { isSupportedCustomizedBuiltInElements } from './support'

export const marpCustomElementsRegisteredSymbol = Symbol()

export const applyCustomElements = (target: ParentNode = document) => {
  const defined = window[marpCustomElementsRegisteredSymbol]
  if (!defined) customElements.define('marp-auto-scaling', MarpAutoScaling)

  for (const tag of Object.keys(elements)) {
    const marpCustomElement = `marp-${tag}`
    const proto: typeof HTMLElement = elements[tag].proto()

    if (!isSupportedCustomizedBuiltInElements() || proto === HTMLElement) {
      if (!defined) {
        customElements.define(
          marpCustomElement,
          createMarpCustomElement(HTMLElement, elements[tag]),
        )
      }

      target
        .querySelectorAll(`${tag}[is="${marpCustomElement}"]`)
        .forEach((customElm) => {
          customElm.outerHTML = customElm.outerHTML
            .replace(new RegExp(`^<${tag}`, 'i'), `<${marpCustomElement}`)
            .replace(new RegExp(`</${tag}>$`, 'i'), `</${marpCustomElement}>`)
        })
    } else if (!defined) {
      customElements.define(
        marpCustomElement,
        createMarpCustomElement(proto, { style: elements[tag].style }),
        { extends: tag },
      )
    }
  }

  window[marpCustomElementsRegisteredSymbol] = true
}
