import { Marpit, MarpitOptions, ThemeSetPackOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import postcss from 'postcss'
import postcssMinifyParams from 'postcss-minify-params'
import postcssMinifySelectors from 'postcss-minify-selectors'
import postcssNormalizeWhitespace from 'postcss-normalize-whitespace'
import { version } from 'katex/package.json'
import browser from './browser'
import * as emojiPlugin from './emoji/emoji'
import * as fittingPlugin from './fitting/fitting'
import * as htmlPlugin from './html/html'
import * as mathPlugin from './math/math'
import * as scriptPlugin from './script/script'
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
  minifyCSS?: boolean
  script?: boolean | scriptPlugin.ScriptOptions
}

const styleMinifier = postcss([
  postcssNormalizeWhitespace,
  postcssMinifyParams,
  postcssMinifySelectors,
])

export class Marp extends Marpit {
  readonly options!: Required<MarpOptions>

  private renderedMath: boolean = false

  static readonly html = { br: [] }

  constructor(opts: MarpOptions = {}) {
    super({
      inlineSVG: true,
      looseYAML: true,
      math: true,
      minifyCSS: true,
      script: true,
      ...opts,
      emoji: {
        shortcode: 'twemoji',
        unicode: 'twemoji',
        ...(opts.emoji || {}),
      },
      markdown: [
        'commonmark',
        {
          breaks: true,
          linkify: true,
          highlight: (code, lang) => this.highlighter(code, lang),
          html: opts.html ?? Marp.html,
          ...(typeof opts.markdown === 'object' ? opts.markdown : {}),
        },
      ],
    } as MarpOptions)

    this.markdown.enable(['table', 'linkify', 'strikethrough'])

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
      .use(scriptPlugin.markdown)
  }

  highlighter(code: string, lang: string): string {
    if (lang) {
      return highlightjs.getLanguage(lang)
        ? highlightjs.highlight(lang, code, true).value
        : ''
    }
    return highlightjs.highlightAuto(code).value
  }

  protected renderStyle(theme?: string): string {
    const original = super.renderStyle(theme)
    if (!this.options.minifyCSS) return original

    return styleMinifier.process(original).css
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

      if (typeof math === 'object') path = math.katexFontPath || undefined

      // Add KaTeX css
      prepend(mathPlugin.css(path))
    }

    return base
  }

  /** @deprecated A script for the browser that is equivalent to `Marp.ready()` has injected into rendered Markdown by default. `Marp.ready()` will remove in future so you have to use `@marp-team/marp-core/browser` instead if you want to execute browser script in script-disabled HTML manually via using such as webpack. */
  static ready() {
    console.warn(
      '[DEPRECATION WARNING] A script for the browser that is equivalent to Marp.ready() has injected into rendered Markdown by default. Marp.ready() will remove in future so you have to use "@marp-team/marp-core/browser" instead if you want to execute browser script in script-disabled HTML manually via using such as webpack.'
    )
    browser()
  }
}

export default Marp
