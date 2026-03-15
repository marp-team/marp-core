import { transformerMetaHighlight } from '@shikijs/transformers'
import { createHighlighterCoreSync, createCssVariablesTheme } from 'shiki/core'
import type {
  HighlighterCore,
  CodeToHastOptions,
  ShikiTransformer,
} from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { bundledLanguagesInfo } from 'shiki/langs'

let _shiki: HighlighterCore | null = null

const supportedLangs: Record<string, string> = {}

bundledLanguagesInfo.map(({ id, aliases }) => {
  if (aliases && aliases.length > 0) {
    aliases.forEach((alias) => {
      supportedLangs[alias] = id
    })
  }
  supportedLangs[id] = id
})

const themeName = 'marp-shiki' as const

const shiki = (): HighlighterCore => {
  if (!_shiki) {
    const theme = createCssVariablesTheme({
      name: themeName,
      variablePrefix: '--marp-shiki-',
    })

    const engine = createJavaScriptRegexEngine({ forgiving: true })

    _shiki = createHighlighterCoreSync({
      themes: [theme],
      langs: [],
      engine,
    })
  }
  return _shiki
}

export const defaultTransformers = [transformerMetaHighlight()]

const bultinTransformer = {
  name: '@marp-team/marp-core:highlighter',
  code(node) {
    this.addClassToHast(node, `language-${this.options.lang}`)
  },
} as const satisfies ShikiTransformer

interface RenderOptions {
  lang: string
  attrs: string
  transformers?: ShikiTransformer[]
}

export const render = (
  code: string,
  { lang, attrs, transformers = defaultTransformers }: RenderOptions,
): string => {
  if (!supportedLangs[lang]) return ''

  const shikiInstance = shiki()

  // Lazy-loading languages to reduce initial loading time
  if (!shikiInstance.getLoadedLanguages().includes(lang)) {
    shikiInstance.loadLanguageSync(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(`@shikijs/langs/${supportedLangs[lang]}`).default,
    )
  }

  const options = {
    lang,
    theme: themeName,
    transformers: [bultinTransformer, ...transformers],
    meta: { __raw: attrs },
    tabindex: false,
  } as const satisfies CodeToHastOptions

  return shikiInstance.codeToHtml(code, options)
}
