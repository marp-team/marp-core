import { attr, code } from './fitting'

export default function fittingObserver(): void {
  Array.from(
    document.querySelectorAll<HTMLElement>(`svg[${attr}="svg"]`),
    svg => {
      const foreignObject = svg.firstChild as SVGForeignObjectElement
      const container = foreignObject.firstChild as HTMLSpanElement
      const { scrollWidth, scrollHeight } = container

      let minWidth = 1

      if (svg.hasAttribute(code)) {
        const pre = svg.parentElement!.parentElement!
        const computed = getComputedStyle(pre)
        const mw = Math.ceil(
          pre.clientWidth -
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
