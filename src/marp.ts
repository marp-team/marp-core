import { Marpit, MarpitOptions, ThemeSetPackOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import { version } from 'katex/package.json'
import browser from './browser'
import * as emojiPlugin from './emoji/emoji'
import * as fittingPlugin from './fitting/fitting'
import * as htmlPlugin from './html/html'
import * as mathPlugin from './math/math'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'
import uncoverTheme from '../themes/uncover.scss'

const marpObservedSymbol = Symbol('marpObserved')

export interface MarpOptions extends MarpitOptions {
  emoji?: emojiPlugin.EmojiOptions
  html?: boolean | { [tag: string]: boolean | string[] }
  markdown?: object
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

  static defaultHtmlOption: MarpOptions['html'] = {}

  constructor(opts: MarpOptions = {}) {
    super(<MarpOptions>{
      inlineSVG: true,
      lazyYAML: true,
      math: true,
      html: Marp.defaultHtmlOption,
      ...opts,
      markdown: [
        'commonmark',
        {
          breaks: true,
          linkify: true,
          ...(typeof opts.markdown === 'object' ? opts.markdown : {}),
          highlight: (code: string, lang: string) =>
            this.highlighter(code, lang),
          html: !!(opts.html !== undefined
            ? opts.html
            : Marp.defaultHtmlOption),
        },
      ],
      emoji: {
        shortcode: 'twemoji',
        twemojiBase: undefined,
        unicode: 'twemoji',
        ...(opts.emoji || {}),
      },
    })

    // Enable table
    this.markdown.enable(['table', 'linkify'])

    // Add themes
    this.themeSet.default = this.themeSet.add(defaultTheme)
    this.themeSet.add(gaiaTheme)
    this.themeSet.add(uncoverTheme)
  }

  applyMarkdownItPlugins(md = this.markdown) {
    super.applyMarkdownItPlugins(md)

    const { emoji, html, math } = this.options

    // HTML sanitizer
    md.use(htmlPlugin.markdown, html)

    // Emoji support
    md.use(emojiPlugin.markdown, emoji)

    // Math typesetting
    if (math) {
      const opts =
        typeof math === 'object' && typeof math.katexOption === 'object'
          ? math.katexOption
          : {}

      md.use(mathPlugin.markdown, opts, flag => (this.renderedMath = flag))
    }

    // Fitting
    const themeResolver: fittingPlugin.ThemeResolver = () =>
      (this.lastGlobalDirectives || {}).theme

    md.use(fittingPlugin.markdown, this, themeResolver)
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
    const prependCSS = css => {
      if (css) base.before = `${css}\n${base.before || ''}`
    }
    const { emoji, math } = this.options

    prependCSS(emojiPlugin.css(emoji!))
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

    browser()
    window[marpObservedSymbol] = true
  }
}

export default Marp
