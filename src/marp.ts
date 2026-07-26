import postcssMinify from '@csstools/postcss-minify'
import { Marpit, Options, ThemeSetPackOptions } from '@marp-team/marpit'
import type { ShikiTransformer } from 'shiki'
import defaultTheme from '../themes/default.scss?inline'
import gaiaTheme from '../themes/gaia.scss?inline'
import uncoverTheme from '../themes/uncover.scss?inline'
import * as autoScalingPlugin from './auto-scaling'
import * as customElements from './custom-elements'
import * as emojiPlugin from './emoji/emoji'
import { defaultHTMLAllowList, type HTMLAllowList } from './html/allowlist'
import * as htmlPlugin from './html/html'
import * as mathPlugin from './math/math'
import * as mermaid from './mermaid/mermaid'
import { mermaidShikiTransformer } from './mermaid/shikiTransformer'
import * as scriptPlugin from './script/script'
import * as shiki from './shiki'
import * as sizePlugin from './size/size'
import * as slugPlugin from './slug/slug'

export interface MarpOptions extends Options {
  emoji?: emojiPlugin.EmojiOptions
  html?: boolean | HTMLAllowList
  markdown?: object
  math?: mathPlugin.MathOptions
  minifyCSS?: boolean
  script?: boolean | scriptPlugin.ScriptOptions
  slug?: slugPlugin.SlugOptions
}

export class Marp extends Marpit {
  declare readonly options: Required<MarpOptions>

  shikiTransformers: ShikiTransformer[] = [...shiki.defaultTransformers]

  static readonly html = defaultHTMLAllowList

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

    // PostCSS plugins
    this.use(customElements.css).use(
      Object.assign(
        () => ({
          ...(this.options.minifyCSS ? postcssMinify() : {}),
          postcssPlugin: 'marp-core-minify-css',
        }),
        { postcss: true as const },
      ),
    )
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

  highlighter(code: string, lang: string, attrs: string): string {
    // Mermaid renderer
    if (lang === 'mermaid') {
      try {
        return mermaid.render(code, {
          interactive: /\binteractive\b/.test(attrs),
        })
      } catch (err) {
        console.warn(err)
      }
    }

    // Mermaid fallback
    if (lang === 'mermaid' || lang === 'mermaid-raw') {
      // Use `mmd` alias to `mermaid`. `mermaid` should not use because of
      // `.language-mermaid` class is required to style the diagram by built-in
      // themes.
      lang = 'mmd'
    }

    // markdown-it-shiki compatible
    if (code.endsWith('\n')) code = code.slice(0, -1)

    const transformers = [...this.shikiTransformers, mermaidShikiTransformer]
    return shiki.render(code, { lang, attrs, transformers })
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
