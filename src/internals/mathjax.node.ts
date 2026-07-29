/* eslint-disable @typescript-eslint/no-require-imports */
import { loadTexPackages } from '../generated/mathjax-lazy-tex-packages'
import type { mathjax as mathjaxStatic } from './mathjax'
import { setupMathJax } from './mathjax/setup'

export const mathjax: typeof mathjaxStatic = () => {
  const { mathjax: mathjaxModule } =
    require('@mathjax/src/mjs/mathjax.js') as typeof import('@mathjax/src/mjs/mathjax.js')
  const { liteAdaptor } =
    require('@mathjax/src/mjs/adaptors/liteAdaptor.js') as typeof import('@mathjax/src/mjs/adaptors/liteAdaptor.js')
  const { RegisterHTMLHandler } =
    require('@mathjax/src/mjs/handlers/html.js') as typeof import('@mathjax/src/mjs/handlers/html.js')
  const { SVG } =
    require('@mathjax/src/mjs/output/svg.js') as typeof import('@mathjax/src/mjs/output/svg.js')
  const { TeX } =
    require('@mathjax/src/mjs/input/tex.js') as typeof import('@mathjax/src/mjs/input/tex.js')

  return setupMathJax({
    mathjax: mathjaxModule,
    liteAdaptor,
    RegisterHTMLHandler,
    SVG,
    TeX,
    loadTexPackages,
  })
}
