import { transformerMetaHighlight } from '@shikijs/transformers'
import { createHighlighterCoreSync, createCssVariablesTheme } from 'shiki/core'
import type {
  CodeToHastOptions,
  HighlighterCore,
  ShikiTransformer,
  ThemeRegistration,
} from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { bundledLanguagesInfo } from 'shiki/langs'
import { langLoaders } from './generated/shiki-lang-loaders'

let _shiki: HighlighterCore | null = null

const supportedLangs: Record<string, string> = {}
const textLangs = ['text', 'txt', 'plain']

bundledLanguagesInfo.map(({ id, aliases }) => {
  if (aliases && aliases.length > 0) {
    aliases.forEach((alias) => {
      supportedLangs[alias] = id
    })
  }
  supportedLangs[id] = id
})

const themeName = 'marp-shiki' as const

export const shikiTheme = (): ThemeRegistration => {
  return createCssVariablesTheme({
    name: themeName,
    variablePrefix: '--marp-shiki-',
  })
}

const shiki = (): HighlighterCore => {
  if (!_shiki) {
    const engine = createJavaScriptRegexEngine({ forgiving: true })

    _shiki = createHighlighterCoreSync({
      themes: [shikiTheme()],
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
  transformers: ShikiTransformer[]
}

export const render = (
  code: string,
  { lang, attrs, transformers }: RenderOptions,
): string => {
  const resolvedLang = textLangs.includes(lang) ? 'text' : supportedLangs[lang]
  if (!resolvedLang) return ''

  const shikiInstance = shiki()

  // Lazy-loading languages to reduce initial loading time
  if (!shikiInstance.getLoadedLanguages().includes(resolvedLang)) {
    const langLoader = langLoaders[resolvedLang]
    if (langLoader) shikiInstance.loadLanguageSync(langLoader())
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
