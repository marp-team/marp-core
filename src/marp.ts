import postcssMinify from '@csstools/postcss-minify'
import { Marpit, Options, ThemeSetPackOptions } from '@marp-team/marpit'
import type { HLJSApi } from 'highlight.js'
import postcss, { AcceptedPlugin } from 'postcss'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'
import uncoverTheme from '../themes/uncover.scss'
import * as autoScalingPlugin from './auto-scaling'
import * as customElements from './custom-elements'
import * as emojiPlugin from './emoji/emoji'
import { generateHighlightJSInstance } from './highlightjs'
import * as htmlPlugin from './html/html'
import * as mathPlugin from './math/math'
import * as scriptPlugin from './script/script'
import * as sizePlugin from './size/size'
import * as slugPlugin from './slug/slug'

export interface MarpOptions extends Options {
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
  slug?: slugPlugin.SlugOptions
}

export class Marp extends Marpit {
  declare readonly options: Required<MarpOptions>

  private _highlightjs: HLJSApi | undefined

  static readonly html = { br: [] }

  constructor(opts: MarpOptions = {}) {
    const mdOpts: Record<string, any> = {
      breaks: true,
      linkify: true,
      highlight: (code, lang, attrs) => this.highlighter(code, lang, attrs),
      html: opts.html ?? Marp.html,
      ...(typeof opts.markdown === 'object' ? opts.markdown : {}),
    }

    super({
      cssContainerQuery: true,
      inlineSVG: true,
      looseYAML: true,
      math: true,
      minifyCSS: true,
      script: true,
      slug: true,
      ...opts,
      emoji: {
        shortcode: 'twemoji',
        unicode: 'twemoji',
        ...(opts.emoji || {}),
      },
      markdown: ['commonmark', mdOpts],
    } as MarpOptions)

    this.markdown.enable(['table', 'linkify', 'strikethrough'])
    this.markdown.linkify.set({ fuzzyLink: false })

    if (mdOpts.typographer) {
      this.markdown.enable(['replacements', 'smartquotes'])
    }

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
      .use(autoScalingPlugin.markdown)
      .use(sizePlugin.markdown)
      .use(scriptPlugin.markdown)
      .use(slugPlugin.markdown)
  }

  get highlightjs() {
    if (!this._highlightjs) {
      this._highlightjs = generateHighlightJSInstance()
    }
    return this._highlightjs
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  highlighter(code: string, lang: string, attrs: string): string {
    if (lang && this.highlightjs.getLanguage(lang)) {
      return this.highlightjs.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      }).value
    }
    return ''
  }

  protected renderStyle(theme?: string): string {
    const original = super.renderStyle(theme)
    const postprocessorPlugins: AcceptedPlugin[] = [
      customElements.css,
      ...(this.options.minifyCSS ? [postcssMinify()] : []),
    ]

    const postprocessor = postcss(postprocessorPlugins)

    return postprocessor.process(original).css
  }

  protected themeSetPackOptions(): ThemeSetPackOptions {
    const base = { ...super.themeSetPackOptions() }
    const prepend = (css) =>
      css && (base.before = `${css}\n${base.before || ''}`)
    const { emoji } = this.options

    prepend(emojiPlugin.css(emoji))

    const mathCss = mathPlugin.css(this)
    if (mathCss) prepend(mathCss)

    return base
  }
}

export default Marp
