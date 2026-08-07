import type { LiteDocument } from '@mathjax/src/mjs/adaptors/lite/Document.js'
import type { LiteNode } from '@mathjax/src/mjs/adaptors/lite/Element.js'
import type { LiteText } from '@mathjax/src/mjs/adaptors/lite/Text.js'
import type {
  liteAdaptor,
  LiteAdaptor,
} from '@mathjax/src/mjs/adaptors/liteAdaptor.js'
import type { HTMLHandler } from '@mathjax/src/mjs/handlers/html/HTMLHandler.js'
import type { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js'
import type { TeX } from '@mathjax/src/mjs/input/tex.js'
import type { mathjax as mathjaxModule } from '@mathjax/src/mjs/mathjax.js'
import type { SVG } from '@mathjax/src/mjs/output/svg.js'
import type { loadTexPackages } from '../../generated/mathjax-tex-packages'

interface MathJaxInterface extends ReturnType<typeof loadTexPackages> {
  mathjax: typeof mathjaxModule
  adaptor: LiteAdaptor
  handler: HTMLHandler<LiteNode, LiteText, LiteDocument>
  SVG: typeof SVG
  TeX: typeof TeX
}

interface MathJaxModules {
  mathjax: typeof mathjaxModule
  liteAdaptor: typeof liteAdaptor
  RegisterHTMLHandler: typeof RegisterHTMLHandler
  SVG: typeof SVG
  TeX: typeof TeX
  loadTexPackages: typeof loadTexPackages
}

let _mathjax: undefined | MathJaxInterface = undefined

export const setupMathJax = (modules: MathJaxModules): MathJaxInterface => {
  if (!_mathjax) {
    const adaptor = modules.liteAdaptor()
    const handler = modules.RegisterHTMLHandler(adaptor)
    const { packages, fontExtensions } = modules.loadTexPackages()

    _mathjax = {
      mathjax: modules.mathjax,
      packages,
      fontExtensions,
      adaptor,
      handler,
      SVG: modules.SVG,
      TeX: modules.TeX,
    }
  }

  return _mathjax
}
