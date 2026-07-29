import {
  loadFontExtensions,
  packages,
} from '../generated/mathjax-lazy-tex-packages'
import type { loadMathJax as loadMathJaxStatic } from './mathjax'

let loadedMathJax: undefined | ReturnType<typeof loadMathJaxStatic>

/* eslint-disable @typescript-eslint/no-require-imports */
export const loadMathJax: typeof loadMathJaxStatic = () =>
  (loadedMathJax ??= {
    fontExtensions: loadFontExtensions(),
    liteAdaptor: (
      require('@mathjax/src/mjs/adaptors/liteAdaptor.js') as typeof import('@mathjax/src/mjs/adaptors/liteAdaptor.js')
    ).liteAdaptor,
    mathjax: (
      require('@mathjax/src/mjs/mathjax.js') as typeof import('@mathjax/src/mjs/mathjax.js')
    ).mathjax,
    packages,
    RegisterHTMLHandler: (
      require('@mathjax/src/mjs/handlers/html.js') as typeof import('@mathjax/src/mjs/handlers/html.js')
    ).RegisterHTMLHandler,
    SVG: (
      require('@mathjax/src/mjs/output/svg.js') as typeof import('@mathjax/src/mjs/output/svg.js')
    ).SVG,
    TeX: (
      require('@mathjax/src/mjs/input/tex.js') as typeof import('@mathjax/src/mjs/input/tex.js')
    ).TeX,
  })
/* eslint-enable @typescript-eslint/no-require-imports */
