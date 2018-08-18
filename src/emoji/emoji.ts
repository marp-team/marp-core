import markdownItEmoji from 'markdown-it-emoji'

export interface EmojiOptions {
  shortcode?: boolean | 'twemoji'
  unicode?: true | 'twemoji'
}

export function css(opts: EmojiOptions): string | undefined {
  return undefined
}

export function markdown(md, opts: EmojiOptions): void {
  if (opts.shortcode) md.use(markdownItEmoji, { shortcuts: {} })
}
