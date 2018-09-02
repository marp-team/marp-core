import { MarpOptions } from '../marp'

export function markdown(md, opts: MarpOptions['html']): void {
  if (typeof opts === 'object') {
    const { html_inline, html_block } = md.renderer.rules

    const sanitizedRenderer = original => (...args) => {
      const html = original(...args)

      // TODO: Sanitize fragment HTML
      return html
    }

    md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
    md.renderer.rules.html_block = sanitizedRenderer(html_block)
  }
}
