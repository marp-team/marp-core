import { attr } from './fitting'

export default function fittingOnBrowser(): void {
  Array.from(
    document.querySelectorAll<HTMLElement>(`svg[${attr}="svg"]`),
    svg => {
      const foreignObject = svg.firstChild as SVGForeignObjectElement
      const container = foreignObject.firstChild as HTMLSpanElement
      const { scrollWidth, scrollHeight } = container
      const w = Math.max(scrollWidth, 1)
      const h = Math.max(scrollHeight, 1)
      const viewBox = `0 0 ${w} ${h}`

      foreignObject.setAttribute('width', `${w}`)
      foreignObject.setAttribute('height', `${h}`)

      svg.setAttribute(
        'preserveAspectRatio',
        getComputedStyle(svg).getPropertyValue('--perserve-aspect-ratio') ||
          'xMinYMin meet'
      )

      if (svg.getAttribute('viewBox') !== viewBox) {
        svg.setAttribute('viewBox', viewBox)
        svg.classList.toggle('__reflow__') // for incremental update
      }
    }
  )
  window.requestAnimationFrame(fittingOnBrowser)
}
