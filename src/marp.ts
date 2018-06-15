/* tslint:disable: import-name */
import { Marpit } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import markdownItEmoji from 'markdown-it-emoji'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'

export class Marp extends Marpit {
  themeSet: any
  markdown: any

  constructor(opts: object = {}) {
    super({
      markdown: [
        'commonmark',
        {
          breaks: true,
          highlight: (code: string, lang: string) =>
            this.highlighter(code, lang),
          linkify: true,
        },
      ],
      ...opts,
    })

    // Enable table
    this.markdown.enable(['table', 'linkify'])

    // Add themes
    this.themeSet.default = this.themeSet.add(defaultTheme)
    this.themeSet.add(gaiaTheme)
  }

  applyMarkdownItPlugins(md: any = this.markdown) {
    super.applyMarkdownItPlugins(md)

    // Emoji shorthand
    md.use(markdownItEmoji, { shortcuts: {} })
    md.renderer.rules.emoji = (token, idx) =>
      `<span data-marpit-emoji>${token[idx].content}</span>`
  }

  highlighter(code: string, lang: string) {
    if (lang) {
      return highlightjs.getLanguage(lang)
        ? highlightjs.highlight(lang, code, true).value
        : ''
    }
    return highlightjs.highlightAuto(code).value
  }
}

export default Marp
