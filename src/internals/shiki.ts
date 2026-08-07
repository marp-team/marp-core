import { createHighlighterCoreSync, createCssVariablesTheme } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { langLoaders } from '../generated/shiki-lang-loaders'
import { setupShiki } from './shiki/setup'

export const shiki = setupShiki({
  langLoaders,
  loadModules: () => ({
    createCssVariablesTheme,
    createHighlighterCoreSync,
    createJavaScriptRegexEngine,
  }),
})
