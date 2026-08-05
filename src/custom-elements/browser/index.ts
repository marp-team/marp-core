import { elements } from '../definitions'
import { createMarpAutoScaling } from './marp-auto-scaling'
import { createMarpCustomElement } from './marp-custom-element'
import { isSupportedCustomizedBuiltInElements } from './support'

export const marpCustomElementsRegisteredSymbol = Symbol()

export { isSupportedCustomizedBuiltInElements } from './support'

export const applyCustomElements = (target?: ParentNode) => {
  target ??= document

  const currentDocument =
    target.nodeType === Node.DOCUMENT_NODE
      ? (target as Document)
      : target.ownerDocument
  const currentWindow = currentDocument?.defaultView || window
  const defined = currentWindow[marpCustomElementsRegisteredSymbol]

  if (!defined) {
    currentWindow.customElements.define(
      'marp-auto-scaling',
      createMarpAutoScaling(currentWindow.HTMLElement),
    )
  }

  for (const tag of Object.keys(elements)) {
    const marpCustomElement = `marp-${tag}`
    const proto: typeof HTMLElement = elements[tag].proto(currentWindow)

    if (
      !isSupportedCustomizedBuiltInElements(currentWindow) ||
      proto === currentWindow.HTMLElement
    ) {
      if (!defined) {
        currentWindow.customElements.define(
          marpCustomElement,
          createMarpCustomElement(currentWindow.HTMLElement, elements[tag]),
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
      currentWindow.customElements.define(
        marpCustomElement,
        createMarpCustomElement(proto, { style: elements[tag].style }),
        { extends: tag },
      )
    }
  }

  currentWindow[marpCustomElementsRegisteredSymbol] = true
}
