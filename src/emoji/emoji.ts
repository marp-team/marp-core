import twemoji from '@twemoji/api'
import emojiRegex from 'emoji-regex'
import type MarkdownIt from 'markdown-it'
import { full as markdownItEmoji } from 'markdown-it-emoji'
import { marpPlugin } from '../plugin'
import twemojiCSS from './twemoji.scss?inline'

type RenderRule = NonNullable<MarkdownIt['renderer']['rules'][string]>
type RuleCore = Parameters<MarkdownIt['core']['ruler']['push']>[1]
type Token = ReturnType<MarkdownIt['parse']>[number]

export interface EmojiOptions {
  shortcode?: boolean | 'twemoji'
  twemoji?: TwemojiOptions
  unicode?: boolean | 'twemoji'
}

interface TwemojiOptions {
  base?: string
  ext?: 'svg' | 'png'
}

const regexForSplit = new RegExp(`(${emojiRegex().source})(?!\uFE0E)`, 'g')

export const css = (opts: EmojiOptions) =>
  opts.shortcode === 'twemoji' || opts.unicode === 'twemoji'
    ? twemojiCSS
    : undefined

export const markdown = marpPlugin((md) => {
  const opts: EmojiOptions = md.marpit.options.emoji
  const twemojiOpts = opts.twemoji || {}
  const twemojiExt = twemojiOpts.ext || 'svg'

  const twemojiParse = (content: string): string =>
    twemoji.parse(content, {
      attributes: () => ({ 'data-marp-twemoji': '' }),
      base: twemojiOpts.base || undefined,
      ext: `.${twemojiExt}`,
      size: twemojiExt === 'svg' ? 'svg' : undefined,
    })

  const twemojiRenderer: RenderRule = (tokens, idx) =>
    twemojiParse(tokens[idx].content)

  if (opts.shortcode) {
    // Pick rules to avoid collision with other markdown-it plugin
    const picker = {
      core: {
        ruler: {
          after: (_, __, rule) => (picker.rule = rule),
        },
      },
      renderer: { rules: {} as { emoji: () => string } },
      rule: null as unknown as RuleCore,
      utils: md.utils,
    }

    markdownItEmoji(picker, { shortcuts: {} })

    // TODO: use md.core.ruler.after
    md.core.ruler.push('marp_emoji', (state) => {
      const { Token } = state

      state.Token = function replacedToken(type, tag, nesting) {
        return new Token(type === 'emoji' ? 'marp_emoji' : type, tag, nesting)
      } as unknown as typeof Token

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
          const newChildren: Token[] = []

          for (const t of token.children ?? []) {
            if (t.type === 'text') {
              const splittedByEmoji = t.content.split(regexForSplit)

              newChildren.push(
                ...splittedByEmoji.reduce<Token[]>(
                  (splitArr, text, idx) =>
                    text.length === 0
                      ? splitArr
                      : [
                          ...splitArr,
                          Object.assign(new Token(t.type, t.tag, t.nesting), {
                            ...t,
                            content: text,
                            type: idx % 2 ? 'marp_unicode_emoji' : 'text',
                          }),
                        ],
                  [],
                ),
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
      token: Token[],
      idx: number,
    ): string => token[idx].content

    const { code_block, code_inline, fence } = md.renderer.rules

    if (opts.unicode === 'twemoji') {
      const wrap = (text: string): string =>
        text
          .split(/(<[^>]*>)/g)
          .reduce(
            (ret, part, idx) =>
              `${ret}${
                idx % 2
                  ? part
                  : part.replace(regexForSplit, ([emoji]) =>
                      twemojiParse(emoji),
                    )
              }`,
            '',
          )

      md.renderer.rules.marp_unicode_emoji = twemojiRenderer

      // markdown-it has default renderer rules for code_inline, code_block and fence, so we can treat them as non-nullable
      md.renderer.rules.code_inline = (...rest) => wrap(code_inline!(...rest))
      md.renderer.rules.code_block = (...rest) => wrap(code_block!(...rest))
      md.renderer.rules.fence = (...rest) => wrap(fence!(...rest))
    }
  }
})
