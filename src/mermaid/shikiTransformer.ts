import type { ShikiTransformer } from 'shiki'

/** @see https://github.com/shikijs/shiki/issues/973#issuecomment-2746298197 */

const mermaidLangs = ['mermaid', 'mermaid-raw', 'mmd']

export const mermaidShikiTransformer: ShikiTransformer = {
  name: '@marp-team/marp-core:mermaid',
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
