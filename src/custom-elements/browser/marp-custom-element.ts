type Constructor<T = object> = new (...args: any[]) => T

export const createMarpCustomElement = <T extends Constructor<HTMLElement>>(
  Base: T,
  { attrs = {}, style }: { attrs?: Record<string, string>; style?: string },
) =>
  class MarpCustomElement extends Base {
    shadowRoot!: ShadowRoot

    constructor(...args: any[]) {
      super(...args)

      for (const [key, value] of Object.entries(attrs)) {
        if (!this.hasAttribute(key)) this.setAttribute(key, value)
      }

      this.attachShadow({ mode: 'open' })
    }

    static get observedAttributes() {
      return ['data-auto-scaling']
    }

    connectedCallback() {
      this._update()
    }

    attributeChangedCallback() {
      this._update()
    }

    _update() {
      const styleTag = style ? `<style>:host { ${style} }</style>` : ''
      let slotTag = '<slot></slot>'

      const { autoScaling } = this.dataset

      if (autoScaling !== undefined) {
        const downscale =
          autoScaling === 'downscale-only' ? 'data-downscale-only' : ''

        slotTag = `<marp-auto-scaling exportparts="svg:auto-scaling" ${downscale}>${slotTag}</marp-auto-scaling>`
      }

      this.shadowRoot.innerHTML = styleTag + slotTag
    }
  }
