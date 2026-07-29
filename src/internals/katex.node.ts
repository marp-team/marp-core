import type { katex as katexStatic } from './katex'

type KaTeX = typeof import('katex')

let loadedKaTeX: KaTeX | undefined = undefined
const loadKaTeX = () =>
  (loadedKaTeX ??=
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('katex') as KaTeX)

export const katex: typeof katexStatic = {
  renderToString: (...args) => loadKaTeX().renderToString(...args),
  get version() {
    return loadKaTeX().version
  },
}
