import { Marpit, MarpitOptions, ThemeSetPackOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import { version } from 'katex/package.json'
import markdownItEmoji from 'markdown-it-emoji'
import fittingOnBrowser from './fitting/browser'
import * as fittingPlugin from './fitting/fitting'
import * as mathPlugin from './math/math'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'
import uncoverTheme from '../themes/uncover.scss'

const marpObservedSymbol = Symbol('marpObserved')

export interface MarpOptions extends MarpitOptions {
  html?: boolean
  math?:
    | boolean
    | {
        katexOption?: object
        katexFontPath?: string | false
      }
}

export class Marp extends Marpit {
  options!: MarpOptions

  private renderedMath: boolean = false

  constructor(opts: MarpOptions = {}) {
    super({
      inlineSVG: true,
      lazyYAML: true,
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
    this.themeSet.add(uncoverTheme)
  }

  applyMarkdownItPlugins(md = this.markdown) {
    super.applyMarkdownItPlugins(md)

    const { inlineSVG, math } = this.options

    // Emoji shorthand
    md.use(markdownItEmoji, { shortcuts: {} })
    md.renderer.rules.emoji = (token, idx) =>
      `<span data-marpit-emoji>${token[idx].content}</span>`

    // Math typesetting
    if (math) {
      const opts =
        typeof math === 'object' && typeof math.katexOption === 'object'
          ? math.katexOption
          : {}

      md.use(mathPlugin.markdown, opts, flag => (this.renderedMath = flag))
    }

    // Fitting header
    md.use(fittingPlugin.markdown, { inlineSVG })
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
    const prependCSS = css => (base.before = `${css}\n${base.before || ''}`)
    const { math } = this.options

    prependCSS(fittingPlugin.css)

    if (math && this.renderedMath) {
      // By default, we use KaTeX web fonts through CDN.
      let path:
        | string
        | undefined = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/fonts/`

      if (typeof math === 'object') {
        path = math.katexFontPath === false ? undefined : math.katexFontPath
      }

      // Add KaTeX css
      prependCSS(mathPlugin.css(path))
    }

    return base
  }

  static ready() {
    if (typeof window === 'undefined') {
      throw new Error('Marp.ready() is only valid in browser context.')
    }
    if (window[marpObservedSymbol]) return

    fittingOnBrowser()
    window[marpObservedSymbol] = true
  }
}

export default Marp
