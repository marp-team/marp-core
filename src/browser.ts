let ready = false

function fitting(): void {
  Array.from(
    document.querySelectorAll<HTMLElement>(
      'svg[data-marp-fitting-header="svg"]'
    ),
    svg => {
      const foreignObject = svg.firstChild as SVGForeignObjectElement
      const container = foreignObject.firstChild as HTMLSpanElement
      const { scrollWidth, scrollHeight } = container
      const w = Math.max(scrollWidth, 1)
      const h = Math.max(scrollHeight, 1)
      const viewBox = `0 0 ${w} ${h}`

      foreignObject.setAttribute('width', `${w}`)
      foreignObject.setAttribute('height', `${h}`)

      if (svg.getAttribute('viewBox') !== viewBox) {
        svg.setAttribute('viewBox', viewBox)
        svg.classList.toggle('__reflow__') // for incremental update
      }
    }
  )
  window.requestAnimationFrame(fitting)
}

export function browser(): void {
  if (ready) return
  ready = true

  fitting()
}
