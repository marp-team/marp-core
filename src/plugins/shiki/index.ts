import { transformerMetaHighlight } from '@shikijs/transformers'
import type { ShikiTransformer } from 'shiki/'
import { bundledLanguagesInfo } from 'shiki/langs'
import { marpPlugin } from '../../plugin'
import { shiki } from '#marp-shiki'
import { name as themeName } from '#marp-shiki-theme'

export const shikiMarpCorePlugin = () => {
  // Languages
  const langs: Record<string, string> = {}
  const textLangs = ['text', 'txt', 'plain']

  bundledLanguagesInfo.map(({ id, aliases }) => {
    if (aliases && aliases.length > 0) {
      aliases.forEach((alias) => {
        langs[alias] = id
      })
    }
    langs[id] = id
  })

  // Class transformer (builtin)
  const classTransformer = {
    name: '@marp-team/marp-core:highlighter',
    code(node) {
      this.addClassToHast(node, `language-${this.options.lang}`)
    },
  } as const satisfies ShikiTransformer

  return marpPlugin(({ marpit: marp }) => {
    // Meta highlight transformer (Initialized in shikiTransformers by default)
    marp.shikiTransformers.push(transformerMetaHighlight())

    marp.highlighter = (code: string, lang: string, attrs: string) => {
      // markdown-it-shiki compatible
      if (code.endsWith('\n')) code = code.slice(0, -1)

      // Render Shiki
      const targetLang = textLangs.includes(lang) ? 'text' : langs[lang]
      if (!targetLang) return ''

      // Lazy-loading languages to reduce initial loading time
      if (!shiki.highlighter.getLoadedLanguages().includes(targetLang)) {
        const langLoader = shiki.resolveLang(targetLang)
        if (langLoader) shiki.highlighter.loadLanguageSync(langLoader())
      }

      return shiki.highlighter.codeToHtml(code, {
        lang,
        theme: themeName,
        transformers: [classTransformer, ...marp.shikiTransformers],
        meta: { __raw: attrs },
        tabindex: false,
      })
    }
  })
}

export default shikiMarpCorePlugin
