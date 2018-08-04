/* tslint:disable: import-name */
import { Marpit, MarpitOptions, ThemeSetPackOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import markdownItEmoji from 'markdown-it-emoji'
import { markdownItPlugin as mathMD, css as mathCSS } from './markdown/math'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'

export interface MarpOptions extends MarpitOptions {
  html?: boolean
  math?: boolean | object
}

export class Marp extends Marpit {
  options!: MarpOptions

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
      math: true,
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

    // Math typesetting
    if (this.options.math) md.use(mathMD)
  }

  highlighter(code: string, lang: string): string {
    if (lang) {
      return highlightjs.getLanguage(lang)
        ? highlightjs.highlight(lang, code, true).value
        : ''
    }
    return highlightjs.highlightAuto(code).value
  }

  protected themeSetPackOptions(): ThemeSetPackOptions {
    const base = { ...super.themeSetPackOptions() }

    if (this.options.math) {
      // Add KaTeX css
      base.before = `${mathCSS()}\n${base.before || ''}`
    }

    return base
  }
}

export default Marp
