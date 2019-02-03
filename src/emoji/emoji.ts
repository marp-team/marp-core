import emojiRegex from 'emoji-regex'
import Token from 'markdown-it/lib/token'
import markdownItEmoji from 'markdown-it-emoji'
import twemoji from 'twemoji'
import { marpEnabledSymbol } from '../symbol'
import twemojiCSS from './twemoji.scss'

export interface EmojiOptions {
  shortcode?: boolean | 'twemoji'
  twemoji?: TwemojiOptions
  unicode?: boolean | 'twemoji'

  /** @deprecated */
  twemojiBase?: string
}

interface TwemojiOptions {
  base?: string
  ext?: 'svg' | 'png'
}

const regexForSplit = new RegExp(`(${emojiRegex().source})`, 'g')

export const css = (opts: EmojiOptions) =>
  opts.shortcode === 'twemoji' || opts.unicode === 'twemoji'
    ? twemojiCSS
    : undefined

export function markdown(md, opts: EmojiOptions): void {
  const twemojiOpts = opts.twemoji || {}
  const twemojiExt = twemojiOpts.ext || 'svg'

  const twemojiParse = (content: string): string =>
    twemoji.parse(content, {
      attributes: () => ({ 'data-marp-twemoji': '' }),
      base:
        opts.twemojiBase ||
        (twemojiOpts && twemojiOpts.base) ||
        'https://twemoji.maxcdn.com/2/',
      ext: `.${twemojiExt}`,
      size: twemojiExt === 'svg' ? 'svg' : 72,
    })

  const twemojiRenderer = (token: any[], idx: number): string =>
    twemojiParse(token[idx].content)

  if (opts.shortcode) {
    md.use(markdownItEmoji, { shortcuts: {} })
    if (opts.shortcode === 'twemoji') md.renderer.rules.emoji = twemojiRenderer
  }

  if (opts.unicode) {
    md.core.ruler.after('inline', 'marp_unicode_emoji', ({ tokens }) => {
      for (const token of tokens) {
        if (token.type === 'inline') {
          const newChildren: any[] = []

          for (const t of token.children) {
            if (t.type === 'text') {
              const splittedByEmoji = t.content.split(regexForSplit)

              newChildren.push(
                ...splittedByEmoji.reduce(
                  (splitedArr, text, idx) =>
                    text.length === 0
                      ? splitedArr
                      : [
                          ...splitedArr,
                          Object.assign(new Token(), {
                            ...t,
                            content: text,
                            type: idx % 2 ? 'marp_unicode_emoji' : 'text',
                          }),
                        ],
                  []
                )
              )
            } else {
              newChildren.push(t)
            }
          }

          token.children = newChildren
        }
      }
    })

    md.renderer.rules.marp_unicode_emoji = (
      token: any[],
      idx: number
    ): string => token[idx].content

    const { code_block, code_inline, fence } = md.renderer.rules

    if (opts.unicode === 'twemoji') {
      const wrap = text =>
        md[marpEnabledSymbol]
          ? text
              .split(/(<[^>]*>)/g)
              .reduce(
                (ret, part, idx) =>
                  `${ret}${
                    idx % 2
                      ? part
                      : part.replace(regexForSplit, ([emoji]) =>
                          twemojiParse(emoji)
                        )
                  }`,
                ''
              )
          : text

      md.renderer.rules.marp_unicode_emoji = twemojiRenderer

      md.renderer.rules.code_inline = (...args) => wrap(code_inline(...args))
      md.renderer.rules.code_block = (...args) => wrap(code_block(...args))
      md.renderer.rules.fence = (...args) => wrap(fence(...args))
    }
  }
}
