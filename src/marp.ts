import { Marpit, MarpitOptions, ThemeSetPackOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import { version } from 'katex/package.json'
import browser from './browser'
import * as emojiPlugin from './emoji/emoji'
import * as fittingPlugin from './fitting/fitting'
import * as htmlPlugin from './html/html'
import * as mathPlugin from './math/math'
import * as sizePlugin from './size/size'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'
import uncoverTheme from '../themes/uncover.scss'

export interface MarpOptions extends MarpitOptions {
  emoji?: emojiPlugin.EmojiOptions
  html?:
    | boolean
    | {
        [tag: string]:
          | string[]
          | { [attr: string]: boolean | ((value: string) => string) }
      }
  markdown?: object
  math?: mathPlugin.MathOptions
}

const marpObservedSymbol = Symbol('marpObserved')

export class Marp extends Marpit {
  readonly options!: Required<MarpOptions>

  private renderedMath: boolean = false

  static html: MarpOptions['html'] = {
    br: [],
  }

  constructor(opts: MarpOptions = {}) {
    super(<MarpOptions>{
      inlineSVG: true,
      looseYAML: true,
      math: true,
      html: Marp.html,
      ...opts,
      markdown: [
        'commonmark',
        {
          breaks: true,
          linkify: true,
          highlight: (code: string, lang: string) =>
            this.highlighter(code, lang),
          ...(typeof opts.markdown === 'object' ? opts.markdown : {}),
          html: opts.html !== undefined ? opts.html : Marp.html,
        },
      ],
      emoji: {
        shortcode: 'twemoji',
        unicode: 'twemoji',
        ...(opts.emoji || {}),
      },
    })

    this.markdown.enable(['table', 'linkify'])

    // Theme support
    this.themeSet.metaType = Object.freeze({
      'auto-scaling': String,
      size: Array,
    })

    this.themeSet.default = this.themeSet.add(defaultTheme)
    this.themeSet.add(gaiaTheme)
    this.themeSet.add(uncoverTheme)
  }

  protected applyMarkdownItPlugins(md) {
    super.applyMarkdownItPlugins(md)

    md.use(htmlPlugin.markdown)
      .use(emojiPlugin.markdown)
      .use(mathPlugin.markdown, flag => (this.renderedMath = flag))
      .use(fittingPlugin.markdown)
      .use(sizePlugin.markdown)
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
    const prepend = css => css && (base.before = `${css}\n${base.before || ''}`)
    const { emoji, math } = this.options

    prepend(emojiPlugin.css(emoji!))
    prepend(fittingPlugin.css)

    if (math && this.renderedMath) {
      // By default, we use KaTeX web fonts through CDN.
      let path:
        | string
        | undefined = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/fonts/`

      if (typeof math === 'object') {
        path = math.katexFontPath === false ? undefined : math.katexFontPath
      }

      // Add KaTeX css
      prepend(mathPlugin.css(path))
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
