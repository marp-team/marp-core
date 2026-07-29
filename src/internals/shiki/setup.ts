import type {
  createCssVariablesTheme,
  createHighlighterCoreSync,
  HighlighterCore,
  LanguageRegistration,
} from 'shiki/core'
import type { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export interface ShikiModules {
  createCssVariablesTheme: typeof createCssVariablesTheme
  createHighlighterCoreSync: typeof createHighlighterCoreSync
  createJavaScriptRegexEngine: typeof createJavaScriptRegexEngine
}

interface ShikiSetupOptions {
  langLoaders: Record<string, () => LanguageRegistration[]>
  loadModules: () => ShikiModules
}

export const setupShiki = ({ langLoaders, loadModules }: ShikiSetupOptions) => {
  let _highlighter: HighlighterCore | null = null

  return {
    get highlighter() {
      if (!_highlighter) {
        const {
          createCssVariablesTheme,
          createHighlighterCoreSync,
          createJavaScriptRegexEngine,
        } = loadModules()

        const engine = createJavaScriptRegexEngine({ forgiving: true })

        const theme = createCssVariablesTheme({
          name: 'marp-shiki',
          variablePrefix: '--marp-shiki-',
        })

        _highlighter = createHighlighterCoreSync({
          themes: [theme],
          langs: [],
          engine,
        })
      }
      return _highlighter
    },
    resolveLang: (lang: string) => langLoaders[lang],
  }
}
