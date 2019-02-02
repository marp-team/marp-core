import selfClosingTags from 'self-closing-tags'
import { FilterXSS } from 'xss'
import { MarpOptions } from '../marp'
import { marpEnabledSymbol } from '../symbol'

export function markdown(md, opts: MarpOptions['html']): void {
  if (typeof opts === 'object') {
    const { html_inline, html_block } = md.renderer.rules

    const filter = new FilterXSS({ whiteList: opts })
    const xhtmlOutFilter = new FilterXSS({
      onTag: (tag, html, { isWhite, isClosing }: any) => {
        if (isWhite && selfClosingTags.includes(tag)) {
          let voidHtml = `<${html.slice(isClosing ? 2 : 1, -1)}`
          if (!voidHtml.endsWith('/')) voidHtml += ' /'

          return `${voidHtml}>`
        }
      },
      whiteList: opts,
    })

    const sanitizedRenderer = (original: Function) => (...args) => {
      const ret = original(...args)
      if (!md[marpEnabledSymbol]) return ret

      const sanitized = filter.process(ret)
      return md.options.xhtmlOut ? xhtmlOutFilter.process(sanitized) : sanitized
    }

    md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
    md.renderer.rules.html_block = sanitizedRenderer(html_block)
  }
}
