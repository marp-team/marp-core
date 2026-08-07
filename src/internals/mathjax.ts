import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js'
import { TeX } from '@mathjax/src/mjs/input/tex.js'
import { mathjax as mathjaxModule } from '@mathjax/src/mjs/mathjax.js'
import { SVG } from '@mathjax/src/mjs/output/svg.js'
import { loadTexPackages } from '../generated/mathjax-tex-packages'
import { setupMathJax } from './mathjax/setup'

export const mathjax = () =>
  setupMathJax({
    mathjax: mathjaxModule,
    liteAdaptor,
    RegisterHTMLHandler,
    SVG,
    TeX,
    loadTexPackages,
  })
