import { attr, code, math } from './fitting'

export default function fittingObserver(): void {
  Array.from(
    document.querySelectorAll<HTMLElement>(`svg[${attr}="svg"]`),
    svg => {
      const foreignObject = svg.firstChild as SVGForeignObjectElement
      const container = foreignObject.firstChild as HTMLSpanElement
      const { scrollWidth, scrollHeight } = container

      let minWidth = 1
      let shrinkBase: HTMLElement | undefined

      if (svg.hasAttribute(code)) shrinkBase = svg.parentElement!.parentElement! // <pre>
      if (svg.hasAttribute(math)) shrinkBase = svg.parentElement! // <p>

      if (shrinkBase) {
        const computed = getComputedStyle(shrinkBase)
        const mw = Math.ceil(
          shrinkBase.clientWidth -
            parseFloat(computed.paddingLeft!) -
            parseFloat(computed.paddingRight!)
        )

        if (mw) minWidth = mw
      }

      const w = Math.max(scrollWidth, minWidth)
      const h = Math.max(scrollHeight, 1)
      const viewBox = `0 0 ${w} ${h}`

      foreignObject.setAttribute('width', `${w}`)
      foreignObject.setAttribute('height', `${h}`)

      svg.setAttribute(
        'preserveAspectRatio',
        getComputedStyle(svg).getPropertyValue('--preserve-aspect-ratio') ||
          'xMinYMin meet'
      )

      if (svg.getAttribute('viewBox') !== viewBox) {
        svg.setAttribute('viewBox', viewBox)
        svg.classList.toggle('__reflow__') // for incremental update
      }
    }
  )
  window.requestAnimationFrame(fittingObserver)
}
