const dataWrapper = 'data-marp-auto-scaling-wrapper'
const dataSvg = 'data-marp-auto-scaling-svg'
const dataContainer = 'data-marp-auto-scaling-container'

export class MarpAutoScaling extends HTMLElement {
  shadowRoot!: ShadowRoot

  private container?: HTMLSpanElement
  private containerSize?: { width: number; height: number }
  private containerObserver: ResizeObserver
  private svg?: SVGElement
  private svgComputedStyle?: CSSStyleDeclaration
  private svgPreserveAspectRatio = 'xMinYMid meet'
  private wrapper?: HTMLDivElement
  private wrapperSize?: { width: number; height: number }
  private wrapperObserver: ResizeObserver

  constructor() {
    super()

    const generateObserverCallback =
      (field: 'containerSize' | 'wrapperSize'): ResizeObserverCallback =>
      ([entry]) => {
        const { width, height } = entry.contentRect

        this[field] = { width, height }
        this.updateSVGRect()
      }

    this.attachShadow({ mode: 'open' })
    this.containerObserver = new ResizeObserver(
      generateObserverCallback('containerSize')
    )
    this.wrapperObserver = new ResizeObserver(
      generateObserverCallback('wrapperSize')
    )
  }

  static get observedAttributes() {
    return ['data-downscale-only']
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
<style>
  svg[${dataSvg}] { display: block; width: 100%; height: auto; vertical-align: top; }
  span[${dataContainer}] { display: table; white-space: var(--marp-auto-scaling-white-space, nowrap); width: max-content; }
</style>
<div ${dataWrapper}>
  <svg part="svg" ${dataSvg}>
    <foreignObject><span ${dataContainer}><slot></slot></span></foreignObject>
  </svg>
</div>
    `
      .split(/\n\s*/)
      .join('')

    this.wrapper =
      this.shadowRoot.querySelector<HTMLDivElement>(`div[${dataWrapper}]`) ??
      undefined

    const previousSvg = this.svg

    this.svg =
      this.wrapper?.querySelector<SVGElement>(`svg[${dataSvg}]`) ?? undefined

    if (this.svg !== previousSvg) {
      this.svgComputedStyle = this.svg
        ? window.getComputedStyle(this.svg)
        : undefined
    }

    this.container =
      this.svg?.querySelector<HTMLSpanElement>(`span[${dataContainer}]`) ??
      undefined

    this.observe()
  }

  disconnectedCallback() {
    this.svg = undefined
    this.svgComputedStyle = undefined
    this.wrapper = undefined
    this.container = undefined

    this.observe()
  }

  attributeChangedCallback() {
    this.observe()
  }

  private observe() {
    this.containerObserver.disconnect()
    this.wrapperObserver.disconnect()

    if (this.wrapper) this.wrapperObserver.observe(this.wrapper)
    if (this.container) this.containerObserver.observe(this.container)

    if (this.svgComputedStyle) this.observeSVGStyle(this.svgComputedStyle)
  }

  private observeSVGStyle(style: CSSStyleDeclaration) {
    const frame = () => {
      const newPreserveAspectRatio = (() => {
        const custom = style.getPropertyValue('--preserve-aspect-ratio')
        if (custom) return custom.trim()

        const xAlign = (({ textAlign, direction }) => {
          if (textAlign.endsWith('left')) return 'Min'
          if (textAlign.endsWith('right')) return 'Max'

          if (textAlign === 'start' || textAlign === 'end') {
            let rAlign = direction === 'rtl'
            if (textAlign === 'end') rAlign = !rAlign

            return rAlign ? 'Max' : 'Min'
          }
          return 'Mid'
        })(style)

        return `x${xAlign}YMid meet`
      })()

      if (newPreserveAspectRatio !== this.svgPreserveAspectRatio) {
        this.svgPreserveAspectRatio = newPreserveAspectRatio
        this.updateSVGRect()
      }

      if (style === this.svgComputedStyle) requestAnimationFrame(frame)
    }
    frame()
  }

  private updateSVGRect() {
    let width = Math.ceil(this.containerSize?.width ?? 0)
    const height = Math.ceil(this.containerSize?.height ?? 0)

    if (this.dataset.downscaleOnly !== undefined) {
      width = Math.max(width, this.wrapperSize?.width ?? 0)
    }

    const foreignObject = this.svg?.querySelector(':scope > foreignObject')
    foreignObject?.setAttribute('width', `${width}`)
    foreignObject?.setAttribute('height', `${height}`)

    if (this.svg) {
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      this.svg.setAttribute('preserveAspectRatio', this.svgPreserveAspectRatio)
      this.svg.style.height = width <= 0 || height <= 0 ? '0' : ''
    }

    if (this.container) {
      const svgPar = this.svgPreserveAspectRatio.toLowerCase()

      this.container.style.marginLeft =
        svgPar.startsWith('xmid') || svgPar.startsWith('xmax') ? 'auto' : '0'
      this.container.style.marginRight = svgPar.startsWith('xmi') ? 'auto' : '0'
    }
  }
}
