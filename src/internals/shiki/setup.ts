import type { HighlighterCore, LanguageRegistration } from 'shiki/core'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { theme } from '#marp-shiki-theme'

export const setupShiki = (
  langLoaders: Record<string, () => LanguageRegistration[]>,
) => {
  let _highlighter: HighlighterCore | null = null

  return {
    get highlighter() {
      if (!_highlighter) {
        const engine = createJavaScriptRegexEngine({ forgiving: true })

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
