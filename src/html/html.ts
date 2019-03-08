import selfClosingTags from 'self-closing-tags'
import { FilterXSS } from 'xss'
import { friendlyAttrValue, escapeAttrValue } from 'xss/lib/default'
import { MarpOptions } from '../marp'
import { marpEnabledSymbol } from '../symbol'

const selfClosingRegexp = /\s*\/?>$/
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

export function markdown(md): void {
  const { html_inline, html_block } = md.renderer.rules

  const sanitizedRenderer = (original: Function) => (...args) => {
    const ret = original(...args)
    if (!md[marpEnabledSymbol]) return ret

    const whiteList = {}
    const html: MarpOptions['html'] = md.options.html

    if (typeof html === 'object') {
      for (const tag of Object.keys(html)) {
        const attrs = html[tag]

        if (Array.isArray(attrs)) {
          whiteList[tag] = attrs
        } else if (typeof attrs === 'object') {
          whiteList[tag] = Object.keys(attrs).filter(
            attr => attrs[attr] !== false
          )
        }
      }
    }

    const filter = new FilterXSS({
      whiteList,
      onIgnoreTag: (_, rawHtml) => (html === true ? rawHtml : undefined),
      safeAttrValue: (tag, attr, value) => {
        let ret = friendlyAttrValue(value)

        if (
          typeof html === 'object' &&
          html[tag] &&
          !Array.isArray(html[tag]) &&
          typeof html[tag][attr] === 'function'
        ) {
          ret = html[tag][attr](ret)
        }

        return escapeAttrValue(ret)
      },
    })

    const sanitized = filter.process(ret)
    return md.options.xhtmlOut ? xhtmlOutFilter.process(sanitized) : sanitized
  }

  md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
  md.renderer.rules.html_block = sanitizedRenderer(html_block)
}
