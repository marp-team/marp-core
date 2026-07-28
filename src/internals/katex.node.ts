type KaTeX = typeof import('katex')

let loadedKaTeX: KaTeX | undefined

const loadKaTeX = () =>
  (loadedKaTeX ??=
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('katex') as KaTeX)

export const katex: Pick<KaTeX, 'renderToString' | 'version'> = {
  renderToString: (...args) => loadKaTeX().renderToString(...args),
  get version() {
    return loadKaTeX().version
  },
}
