import emojiRegex from 'emoji-regex'
import markdownItEmoji from 'markdown-it-emoji'
import twemoji from 'twemoji'
import { marpEnabledSymbol } from '../symbol'
import twemojiCSS from './twemoji.scss'

export interface EmojiOptions {
  shortcode?: boolean | 'twemoji'
  twemoji?: TwemojiOptions
  unicode?: boolean | 'twemoji'

  /** @deprecated Use `twemoji.base` instead. */
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
        twemojiOpts.base ||
        (() => {
          if (opts.twemojiBase)
            console.warn(
              'Deprecation warning: twemojiBase option has been deprecated and would remove in next version. Please use twemoji.base option instead.'
            )
          return opts.twemojiBase
        })() ||
        'https://twemoji.maxcdn.com/2/',
      ext: `.${twemojiExt}`,
      size: twemojiExt === 'svg' ? 'svg' : 72,
    })

  const twemojiRenderer = (token: any[], idx: number): string =>
    twemojiParse(token[idx].content)

  if (opts.shortcode) {
    // Pick rules to avoid collision with other markdown-it plugin
    const picker = {
      core: { ruler: { push: (_, rule) => (picker.rule = rule) } },
      renderer: { rules: { emoji: () => {} } },
      rule: <Function>(() => {}),
      utils: md.utils,
    }

    markdownItEmoji(picker, { shortcuts: {} })

    md.core.ruler.push('marp_emoji', state => {
      const { Token } = state

      state.Token = function replacedToken(name, ...args) {
        return new Token(name === 'emoji' ? 'marp_emoji' : name, ...args)
      }

      picker.rule(state)
      state.Token = Token
    })

    md.renderer.rules.marp_emoji =
      opts.shortcode === 'twemoji'
        ? twemojiRenderer
        : picker.renderer.rules.emoji
  }

  if (opts.unicode) {
    md.core.ruler.after('inline', 'marp_unicode_emoji', ({ tokens, Token }) => {
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
