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

    this.attachShadow({ mode: 'open' })
    this.containerObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect

      this.containerSize = { width, height }
      this.updateSVGRect()
    })
    this.wrapperObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect

      this.wrapperSize = { width, height }
      this.updateSVGRect()
    })
  }

  static get observedAttributes() {
    return ['data-downscale-only']
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        svg[data-marp-auto-scaling-svg] {
          display: block;
          width: 100%;
          height: auto;
          vertical-align: top;
        }
        span[data-marp-auto-scaling-container] {
          display: table;
          white-space: nowrap;
          width: -webkit-max-content;
          width: -moz-max-content;
          width: max-content;
        }
      </style>
      <div data-marp-auto-scaling-wrapper>
        <svg part="svg" data-marp-auto-scaling-svg>
          <foreignObject>
            <span data-marp-auto-scaling-container>
              <slot></slot>
            </span>
          </foreignObject>
        </svg>
      </div>
    `
      .split(/\n\s*/)
      .join('')

    this.wrapper =
      this.shadowRoot.querySelector<HTMLDivElement>(
        'div[data-marp-auto-scaling-wrapper]'
      ) ?? undefined

    const previousSvg = this.svg

    this.svg =
      this.wrapper?.querySelector<SVGElement>(
        'svg[data-marp-auto-scaling-svg]'
      ) ?? undefined

    if (this.svg !== previousSvg) {
      this.svgComputedStyle = this.svg
        ? window.getComputedStyle(this.svg)
        : undefined
    }

    this.container =
      this.svg?.querySelector<HTMLSpanElement>(
        'span[data-marp-auto-scaling-container]'
      ) ?? undefined

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

        switch (style.textAlign) {
          case 'left':
          case '-webkit-left':
            return 'xMinYMid meet'
          case 'right':
          case '-webkit-right':
            return 'xMaxYMid meet'
          case 'start':
            return `x${style.direction === 'rtl' ? 'Max' : 'Min'}YMid meet`
          case 'end':
            return `x${style.direction === 'rtl' ? 'Min' : 'Max'}YMid meet`
        }
        return 'xMidYMid meet'
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
    if (!this.containerSize) return

    let width = Math.ceil(this.containerSize.width)
    const height = Math.ceil(this.containerSize.height)

    if (this.dataset.downscaleOnly !== undefined) {
      width = Math.max(width, this.wrapperSize?.width ?? 1)
    }

    this.svg?.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.svg?.setAttribute('preserveAspectRatio', this.svgPreserveAspectRatio)

    const foreignObject = this.svg?.querySelector(':scope > foreignObject')
    foreignObject?.setAttribute('width', `${width}`)
    foreignObject?.setAttribute('height', `${height}`)
  }
}
