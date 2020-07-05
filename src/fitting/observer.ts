import { attr, code, math } from './data'

const updateAttr = (elm: Element, attr: string, value: string): true | void => {
  if (elm.getAttribute(attr) !== value) {
    elm.setAttribute(attr, value)
    return true
  }
}

export default function fittingObserver(): void {
  Array.from(
    document.querySelectorAll<HTMLElement>(`svg[${attr}="svg"]`),
    (svg) => {
      const foreignObject = svg.firstChild as SVGForeignObjectElement
      const container = foreignObject.firstChild as HTMLSpanElement
      const { scrollWidth, scrollHeight } = container

      let minWidth = 1
      let shrinkBase: HTMLElement | null | undefined

      if (svg.hasAttribute(code)) shrinkBase = svg.parentElement?.parentElement // <pre>
      if (svg.hasAttribute(math)) shrinkBase = svg.parentElement // <p>

      if (shrinkBase) {
        const computed = getComputedStyle(shrinkBase)
        const mw = Math.ceil(
          shrinkBase.clientWidth -
            parseFloat(computed.paddingLeft || '0') -
            parseFloat(computed.paddingRight || '0')
        )

        if (mw) minWidth = mw
      }

      const w = Math.max(scrollWidth, minWidth)
      const h = Math.max(scrollHeight, 1)
      const viewBox = `0 0 ${w} ${h}`

      updateAttr(foreignObject, 'width', `${w}`)
      updateAttr(foreignObject, 'height', `${h}`)
      updateAttr(
        svg,
        'preserveAspectRatio',
        getComputedStyle(svg).getPropertyValue('--preserve-aspect-ratio') ||
          'xMinYMin meet'
      )

      // for incremental update
      if (updateAttr(svg, 'viewBox', viewBox)) {
        svg.classList.toggle('__reflow__')
      }
    }
  )
}
