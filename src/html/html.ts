import { FilterXSS } from 'xss'
import { MarpOptions } from '../marp'
import { marpEnabledSymbol } from '../symbol'

export function markdown(md, opts: MarpOptions['html']): void {
  if (typeof opts === 'object') {
    const { html_inline, html_block } = md.renderer.rules
    const filter = new FilterXSS({ whiteList: opts })

    const sanitizedRenderer = (original: Function) => (...args) => {
      const ret = original(...args)

      return md[marpEnabledSymbol] ? filter.process(ret) : ret
    }

    md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
    md.renderer.rules.html_block = sanitizedRenderer(html_block)
  }
}
