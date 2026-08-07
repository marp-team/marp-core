/* eslint-disable @typescript-eslint/no-require-imports */
import { langLoaders } from '../generated/shiki-lang-lazy-loaders'
import { setupShiki } from './shiki/setup'

export const shiki = setupShiki({
  langLoaders,
  loadModules: () => {
    const { createCssVariablesTheme, createHighlighterCoreSync } =
      require('shiki/core') as typeof import('shiki/core')
    const { createJavaScriptRegexEngine } =
      require('shiki/engine/javascript') as typeof import('shiki/engine/javascript')

    return {
      createCssVariablesTheme,
      createHighlighterCoreSync,
      createJavaScriptRegexEngine,
    }
  },
})
