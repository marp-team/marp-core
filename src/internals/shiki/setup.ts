import type { HighlighterCore, LanguageRegistration } from 'shiki/core'
import { createHighlighterCoreSync, createCssVariablesTheme } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export const setupShiki = (
  langLoaders: Record<string, () => LanguageRegistration[]>,
) => {
  let _highlighter: HighlighterCore | null = null

  return {
    get highlighter() {
      if (!_highlighter) {
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
