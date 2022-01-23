import selfClosingTags from 'self-closing-tags'
import { FilterXSS } from 'xss'
import { friendlyAttrValue, escapeAttrValue } from 'xss/lib/default'
import { MarpOptions } from '../marp'

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

  const sanitizedRenderer =
    (original: (...args: any[]) => string) =>
    (...args) => {
      const ret = original(...args)

      // Pick comments
      const splitted: string[] = []
      let pos = 0

      while (pos < ret.length) {
        const startIdx = ret.indexOf('<!--', pos)
        let endIdx = startIdx !== -1 ? ret.indexOf('-->', startIdx + 4) : -1

        if (endIdx === -1) {
          splitted.push(ret.slice(pos))
          break
        }

        endIdx += 3
        splitted.push(ret.slice(pos, startIdx), ret.slice(startIdx, endIdx))
        pos = endIdx
      }

      // Apply filter to each contents by XSS
      const allowList = {}
      const html: MarpOptions['html'] = md.options.html

      if (typeof html === 'object') {
        for (const tag of Object.keys(html)) {
          const attrs = html[tag]

          if (Array.isArray(attrs)) {
            allowList[tag] = attrs
          } else if (typeof attrs === 'object') {
            allowList[tag] = Object.keys(attrs).filter(
              (attr) => attrs[attr] !== false
            )
          }
        }
      }

      const filter = new FilterXSS({
        whiteList: allowList,
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

      return splitted
        .map((part, idx) => {
          if (idx % 2 === 1) return part

          const sanitized = filter.process(part)

          return md.options.xhtmlOut
            ? xhtmlOutFilter.process(sanitized)
            : sanitized
        })
        .join('')
    }

  md.renderer.rules.html_inline = sanitizedRenderer(html_inline)
  md.renderer.rules.html_block = sanitizedRenderer(html_block)
}
