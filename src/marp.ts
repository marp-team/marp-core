/* tslint:disable: import-name */
import { Marpit, MarpitOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import markdownItEmoji from 'markdown-it-emoji'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'

export interface MarpOptions extends MarpitOptions {
  html?: boolean
}

export class Marp extends Marpit {
  constructor(opts: MarpOptions = {}) {
    super({
      markdown: [
        'commonmark',
        {
          breaks: true,
          highlight: (code: string, lang: string) =>
            this.highlighter(code, lang),
          html: opts.html !== undefined ? opts.html : false,
          linkify: true,
        },
      ],
      ...opts,
    } as MarpitOptions)

    // Enable table
    this.markdown.enable(['table', 'linkify'])

    // Add themes
    this.themeSet.default = this.themeSet.add(defaultTheme)
    this.themeSet.add(gaiaTheme)
  }

  applyMarkdownItPlugins(md = this.markdown) {
    super.applyMarkdownItPlugins(md)

    // Emoji shorthand
    md.use(markdownItEmoji, { shortcuts: {} })
    md.renderer.rules.emoji = (token, idx) =>
      `<span data-marpit-emoji>${token[idx].content}</span>`
  }

  highlighter(code: string, lang: string): string {
    if (lang) {
      return highlightjs.getLanguage(lang)
        ? highlightjs.highlight(lang, code, true).value
        : ''
    }
    return highlightjs.highlightAuto(code).value
  }
}

export default Marp
