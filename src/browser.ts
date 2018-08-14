let ready = false

function fit() {
  Array.from(
    document.querySelectorAll('svg[data-marp-fitting-header="svg"]'),
    element => {
      const svg = element as SVGElement
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

        // Reflow forcely (CSS reflow would not trigger in Firefox)
        svg.style.overflow = 'hidden'
        setTimeout(() => (svg.style.overflow = 'visible'), 0)
      }
    }
  )
  window.requestAnimationFrame(fit)
}

export function browser(): void {
  if (ready) return
  ready = true

  window.requestAnimationFrame(fit)
}
