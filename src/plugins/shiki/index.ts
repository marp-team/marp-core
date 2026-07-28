import { transformerMetaHighlight } from '@shikijs/transformers'
import type { ShikiTransformer } from 'shiki'
import { languageIds } from '../../generated/shiki-language-ids'
import { marpPlugin } from '../../plugin'
import { shiki } from '#marp-shiki'

export const shikiMarpCorePlugin = () => {
  const textLangs = ['text', 'txt', 'plain']

  // Class transformer
  const classTransformer = {
    name: '@marp-team/marp-core/plugin/shiki:class',
    code(node) {
      this.addClassToHast(node, `language-${this.options.lang}`)
    },
  } as const satisfies ShikiTransformer

  // Transformer for mermaid code blocks
  // @see https://github.com/shikijs/shiki/issues/973#issuecomment-2746298197
  const mermaidLangs = ['mermaid', 'mermaid-raw', 'mmd']
  const mermaidTransformer: ShikiTransformer = {
    name: '@marp-team/marp-core/plugin/shiki:mermaid',
    preprocess(code, options) {
      if (mermaidLangs.includes(options.lang)) {
        return '~~~~~~~~~~mermaid\n' + code + '\n~~~~~~~~~~'
      }
    },
    code(code) {
      if (mermaidLangs.includes(this.options.lang)) {
        code.children.splice(0, 2)
        code.children.splice(-2, 2)
      }
    },
  }

  return marpPlugin(({ marpit: marp }) => {
    // Meta highlight transformer (Initialized in shikiTransformers by default)
    marp.shikiTransformers.push(transformerMetaHighlight())

    marp.highlighter = (code: string, lang: string, attrs: string) => {
      // markdown-it-shiki compatible
      if (code.endsWith('\n')) code = code.slice(0, -1)

      // Render Shiki
      const targetLang = textLangs.includes(lang) ? 'text' : languageIds[lang]
      if (!targetLang) return ''

      // Lazy-loading languages to reduce initial loading time
      if (!shiki.highlighter.getLoadedLanguages().includes(targetLang)) {
        const langLoader = shiki.resolveLang(targetLang)
        if (langLoader) shiki.highlighter.loadLanguageSync(langLoader())
      }

      return shiki.highlighter.codeToHtml(code, {
        lang,
        theme: 'marp-shiki',
        transformers: [
          classTransformer,
          mermaidTransformer,
          ...marp.shikiTransformers,
        ],
        meta: { __raw: attrs },
        tabindex: false,
      })
    }
  })
}

export default shikiMarpCorePlugin
