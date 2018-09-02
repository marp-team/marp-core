import { FilterXSS } from 'xss'
import { MarpOptions } from '../marp'

export function markdown(md, opts: MarpOptions['html']): void {
  if (typeof opts === 'object') {
    const { html_inline, html_block } = md.renderer.rules
    const filter = new FilterXSS({ whiteList: opts })

    const sanitizedRenderer = original => (...args) =>
      filter.process(original(...args))

    md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
    md.renderer.rules.html_block = sanitizedRenderer(html_block)
  }
}
