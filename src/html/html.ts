import selfClosingTags from 'self-closing-tags'
import { FilterXSS } from 'xss'
import { friendlyAttrValue, escapeAttrValue } from 'xss/lib/default'
import { MarpOptions } from '../marp'
import { marpEnabledSymbol } from '../symbol'

const selfClosingRegexp = /\s*\/?>$/

export function markdown(md, opts: MarpOptions['html']): void {
  const filter = new FilterXSS({
    onIgnoreTag: (_, html) => (opts === true ? html : undefined),
    safeAttrValue: (_, __, v) => escapeAttrValue(friendlyAttrValue(v)),
    whiteList: typeof opts === 'object' ? opts : {},
  })

  const xhtmlOutFilter = new FilterXSS({
    onIgnoreTag: (tag, html, { isClosing }: any) => {
      if (selfClosingTags.includes(tag)) {
        const attrs = html.slice(tag.length + (isClosing ? 2 : 1), -1).trim()
        return `<${tag} ${attrs}>`.replace(selfClosingRegexp, ' />')
      }
      return html
    },
    whiteList: {},
  })

  const { html_inline, html_block } = md.renderer.rules

  const sanitizedRenderer = (original: Function) => (...args) => {
    const ret = original(...args)
    if (!md[marpEnabledSymbol]) return ret

    const sanitized = filter.process(ret)
    return md.options.xhtmlOut ? xhtmlOutFilter.process(sanitized) : sanitized
  }

  md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
  md.renderer.rules.html_block = sanitizedRenderer(html_block)
}
