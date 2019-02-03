import selfClosingTags from 'self-closing-tags'
import { FilterXSS } from 'xss'
import { MarpOptions } from '../marp'
import { marpEnabledSymbol } from '../symbol'

const selfClosingRegexp = /\s*\/?>$/

export function markdown(md, opts: MarpOptions['html']): void {
  const filterOpts = {
    onIgnoreTag: (_, html) => (opts === true ? html : undefined),
    whiteList: typeof opts === 'object' ? opts : {},
  }
  const filter = new FilterXSS(filterOpts)
  const xhtmlOutFilter = new FilterXSS({
    ...filterOpts,
    onTag: (tag, html, { isClosing }: any) => {
      if (selfClosingTags.includes(tag)) {
        const attrs = html.slice(tag.length + (isClosing ? 2 : 1), -1).trim()
        return `<${tag} ${attrs}>`.replace(selfClosingRegexp, ' />')
      }
    },
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
