import marpitPlugin from '@marp-team/marpit/plugin'
import emojiRegex from 'emoji-regex'
import markdownItEmoji from 'markdown-it-emoji'
import twemoji from 'twemoji'
import twemojiCSS from './twemoji.scss'

export interface EmojiOptions {
  shortcode?: boolean | 'twemoji'
  twemoji?: TwemojiOptions
  unicode?: boolean | 'twemoji'
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

export const markdown = marpitPlugin((md) => {
  const opts: EmojiOptions = md.marpit.options.emoji
  const twemojiOpts = opts.twemoji || {}
  const twemojiExt = twemojiOpts.ext || 'svg'

  const twemojiParse = (content: string): string =>
    twemoji.parse(content, {
      attributes: () => ({ 'data-marp-twemoji': '' }),
      base: twemojiOpts.base || 'https://twemoji.maxcdn.com/2/',
      ext: `.${twemojiExt}`,
      size: twemojiExt === 'svg' ? 'svg' : 72,
    })

  const twemojiRenderer = (token: any[], idx: number): string =>
    twemojiParse(token[idx].content)

  if (opts.shortcode) {
    // Pick rules to avoid collision with other markdown-it plugin
    const picker = {
      core: { ruler: { push: (_, rule) => (picker.rule = rule) } },
      renderer: { rules: { emoji: () => {} } }, // eslint-disable-line @typescript-eslint/no-empty-function
      rule: (() => {}) as (...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-empty-function
      utils: md.utils,
    }

    markdownItEmoji(picker, { shortcuts: {} })

    md.core.ruler.push('marp_emoji', (state) => {
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
      const wrap = (text) =>
        text
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

      md.renderer.rules.marp_unicode_emoji = twemojiRenderer

      md.renderer.rules.code_inline = (...args) => wrap(code_inline(...args))
      md.renderer.rules.code_block = (...args) => wrap(code_block(...args))
      md.renderer.rules.fence = (...args) => wrap(fence(...args))
    }
  }
})
