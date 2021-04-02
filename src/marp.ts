import { Marpit, Options, ThemeSetPackOptions } from '@marp-team/marpit'
import highlightjs from 'highlight.js'
import postcss from 'postcss'
import postcssMinifyParams from 'postcss-minify-params'
import postcssMinifySelectors from 'postcss-minify-selectors'
import postcssNormalizeWhitespace from 'postcss-normalize-whitespace'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'
import uncoverTheme from '../themes/uncover.scss'
import * as emojiPlugin from './emoji/emoji'
import * as fittingPlugin from './fitting/fitting'
import * as htmlPlugin from './html/html'
import * as mathPlugin from './math/math'
import * as scriptPlugin from './script/script'
import * as sizePlugin from './size/size'

export interface MarpOptions extends Options {
  emoji?: emojiPlugin.EmojiOptions
  html?:
    | boolean
    | {
        [tag: string]:
          | string[]
          | { [attr: string]: boolean | ((value: string) => string) }
      }
  markdown?: object // eslint-disable-line @typescript-eslint/ban-types
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
          highlight: (code, lang, attrs) => this.highlighter(code, lang, attrs),
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
      .use(mathPlugin.markdown)
      .use(fittingPlugin.markdown)
      .use(sizePlugin.markdown)
      .use(scriptPlugin.markdown)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  highlighter(code: string, lang: string, attrs: string): string {
    if (lang && highlightjs.getLanguage(lang)) {
      return highlightjs.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      }).value
    }
    return ''
  }

  protected renderStyle(theme?: string): string {
    const original = super.renderStyle(theme)
    if (!this.options.minifyCSS) return original

    return styleMinifier.process(original).css
  }

  protected themeSetPackOptions(): ThemeSetPackOptions {
    const base = { ...super.themeSetPackOptions() }
    const prepend = (css) =>
      css && (base.before = `${css}\n${base.before || ''}`)
    const { emoji } = this.options

    prepend(emojiPlugin.css(emoji))
    prepend(fittingPlugin.css)

    const mathCss = mathPlugin.css(this)
    if (mathCss) prepend(mathCss)

    return base
  }
}

export default Marp
