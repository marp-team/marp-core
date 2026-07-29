import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js'
import { TeX } from '@mathjax/src/mjs/input/tex.js'
import { mathjax } from '@mathjax/src/mjs/mathjax.js'
import { SVG } from '@mathjax/src/mjs/output/svg.js'
import { loadFontExtensions, packages } from '../generated/mathjax-tex-packages'

export const loadMathJax = () => ({
  fontExtensions: loadFontExtensions(),
  liteAdaptor,
  mathjax,
  packages,
  RegisterHTMLHandler,
  SVG,
  TeX,
})
