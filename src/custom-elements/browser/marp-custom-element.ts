type Constructor<T = object> = new (...args: any[]) => T

export const createMarpCustomElement = <T extends Constructor<HTMLElement>>(
  Base: T,
  { attrs = {}, style }: { attrs?: Record<string, string>; style?: string },
) =>
  class MarpCustomElement extends Base {
    declare readonly shadowRoot: ShadowRoot | null

    constructor(...args: any[]) {
      super(...args)

      for (const [key, value] of Object.entries(attrs)) {
        if (!this.hasAttribute(key)) this.setAttribute(key, value)
      }

      this._shadow()
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

    _shadow() {
      if (!this.shadowRoot) {
        try {
          this.attachShadow({ mode: 'open' })
        } catch (e) {
          if (!(e instanceof Error && e.name === 'NotSupportedError')) throw e
        }
      }
      return this.shadowRoot
    }

    _update() {
      const shadowRoot = this._shadow()

      if (shadowRoot) {
        const styleTag = style ? `<style>:host { ${style} }</style>` : ''
        let slotTag = '<slot></slot>'

        const { autoScaling } = this.dataset

        if (autoScaling !== undefined) {
          const downscale =
            autoScaling === 'downscale-only' ? 'data-downscale-only' : ''

          slotTag = `<marp-auto-scaling exportparts="svg:auto-scaling" ${downscale}>${slotTag}</marp-auto-scaling>`
        }

        shadowRoot.innerHTML = styleTag + slotTag
      }
    }
  }
