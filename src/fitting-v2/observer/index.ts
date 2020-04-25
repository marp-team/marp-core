import {
  fittingContentAttr,
  fittingElementAttr,
  fittingElementEnabledAttr,
} from '../attrs'
import { ComputedStyleObserver, computedStyle } from './computed-style-observer'
import { ElementManager } from './element-manager'

type UpdateContentOpts = {
  content?: Element
  foreignObject?: SVGForeignObjectElement
  size?: { width: number; height: number }
}

const fittingElementManager = new ElementManager(`[${fittingElementAttr}]`)

const parentSVGSymbol = Symbol('marp-core-fitting-element-parent-svg')

const parseEnableState = (propValue: string): boolean =>
  propValue.trim() === 'false' ? false : !!propValue

const svgNS = 'http://www.w3.org/2000/svg'

const updateAttribute = (element: Element, name: string, value: string) => {
  const current = element.getAttribute(name)

  if (current !== value) {
    element.setAttribute(name, value)
    return true
  }

  return false
}

const updateContent = (svg: SVGSVGElement, opts: UpdateContentOpts = {}) => {
  const content = opts.content || svg.querySelector(`[${fittingContentAttr}]`)!
  const foreignObject =
    opts.foreignObject || svg.querySelector('foreignObject')!

  // Get computed style
  const style = computedStyle(svg)
  const align = style.getPropertyValue('text-align')
  const shrinkOnly = parseEnableState(
    style.getPropertyValue('--marp-core-fitting-shrink-only')
  )

  // Calculate content size
  let w = opts.size?.width || content.scrollWidth
  const h = opts.size?.height || content.scrollHeight

  if (shrinkOnly) {
    let container = svg.parentElement?.parentElement

    // Dig to the block element
    while (container && !container.clientWidth) {
      container = container.parentElement
    }

    if (container) {
      const computed = computedStyle(container)

      w = Math.max(
        w,
        container.clientWidth -
          parseFloat(computed.paddingLeft || '0') -
          parseFloat(computed.paddingRight || '0')
      )
    }
  }

  updateAttribute(foreignObject, 'width', w.toString())
  updateAttribute(foreignObject, 'height', h.toString())

  // Detemine alignment
  updateAttribute(
    svg,
    'preserveAspectRatio',
    ((): string => {
      switch (align) {
        case 'left':
        case 'start':
          return 'xMinYMid meet'
        case 'right':
        case 'end':
          return 'xMaxYMid meet'
        default:
          return 'xMidYMid meet'
      }
    })()
  )

  updateAttribute(svg, 'viewBox', `0 0 ${w} ${h}`)
}

const contentResizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    updateContent(entry.target[parentSVGSymbol], { size: entry.contentRect })
  }
})

// Create and dispose SVG element
const createFittingDOM = (element: Element, content: Element) => {
  const foreignObject = document.createElementNS(svgNS, 'foreignObject')
  foreignObject.setAttribute('width', '1')
  foreignObject.setAttribute('height', '1')
  foreignObject.appendChild(content)

  const svg = document.createElementNS(svgNS, 'svg')
  svg.appendChild(foreignObject)

  content[parentSVGSymbol] = svg
  element.appendChild(svg)

  updateContent(svg, { foreignObject, content })
  contentResizeObserver.observe(content)
}

const disposeFittingDom = (element: Element, content: Element) => {
  contentResizeObserver.unobserve(content)

  while (element.firstChild) element.removeChild(element.firstChild)
  element.appendChild(content)
}

const updateElement = (element: Element) => {
  const style = computedStyle(element)
  const elmType = element.getAttribute(fittingElementAttr)
  const current = element.hasAttribute(fittingElementEnabledAttr)
  const enabled = parseEnableState(
    style.getPropertyValue(`--marp-core-fitting-${elmType}`)
  )

  if (current !== enabled) {
    const content = element.querySelector(`[${fittingContentAttr}]`)!

    if (enabled) {
      element.setAttribute(fittingElementEnabledAttr, '')
      createFittingDOM(element, content)
    } else {
      element.removeAttribute(fittingElementEnabledAttr)
      disposeFittingDom(element, content)
    }
  } else if (current) {
    // Notify to update svg
    updateContent(element.querySelector('svg')!)
  }
}

// Watch the change of CSS properties
const fittingElementStyleObserver = new ComputedStyleObserver((entries) =>
  new Set(entries.map((entry) => entry.target)).forEach(updateElement)
)

fittingElementManager.onAdded = (element) => {
  updateElement(element)
  fittingElementStyleObserver.observe(element, {
    properties: [
      '--marp-core-fitting-code',
      '--marp-core-fitting-header',
      '--marp-core-fitting-math',
      '--marp-core-fitting-shrink-only',
      'max-height',
      'text-align',
    ],
  })
}

fittingElementManager.onRemoved = (element) => {
  updateElement(element)
  fittingElementStyleObserver.unobserve(element)
}

export const observer = () => {
  fittingElementManager.start()
}
