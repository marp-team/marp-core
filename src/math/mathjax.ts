import type { LiteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js'
import type { mathjax } from '@mathjax/src/mjs/mathjax.js'
import {
  packages,
  registerMathJaxTexPackages,
} from '../generated/mathjax-tex-packages'
import { getMathContext, setMathContext } from './context'
import mathjaxScss from './mathjax.scss?inline'

type MathJax = typeof mathjax

const _initializeMathJax = () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { liteAdaptor } =
    require('@mathjax/src/mjs/adaptors/liteAdaptor.js') as typeof import('@mathjax/src/mjs/adaptors/liteAdaptor.js')
  const { RegisterHTMLHandler } =
    require('@mathjax/src/mjs/handlers/html.js') as typeof import('@mathjax/src/mjs/handlers/html.js')
  const { TeX } =
    require('@mathjax/src/mjs/input/tex.js') as typeof import('@mathjax/src/mjs/input/tex.js')
  const { mathjax } =
    require('@mathjax/src/mjs/mathjax.js') as typeof import('@mathjax/src/mjs/mathjax.js')
  const { SVG } =
    require('@mathjax/src/mjs/output/svg.js') as typeof import('@mathjax/src/mjs/output/svg.js')
  /* eslint-enable @typescript-eslint/no-require-imports */

  return {
    fontExtensions: registerMathJaxTexPackages(),
    liteAdaptor,
    mathjax,
    packages,
    RegisterHTMLHandler,
    SVG,
    TeX,
  } as const
}

let loadedMathJax: ReturnType<typeof _initializeMathJax> | undefined

const loadMathJax = () => (loadedMathJax ??= _initializeMathJax())

// ---

interface MathJaxContext {
  adaptor: LiteAdaptor
  css: string
  document: ReturnType<MathJax['document']>
}

const context = (marpit: any): MathJaxContext => {
  let { mathjaxContext } = getMathContext(marpit)

  if (!mathjaxContext) {
    const {
      mathjax,
      fontExtensions,
      liteAdaptor,
      packages,
      RegisterHTMLHandler,
      SVG,
      TeX,
    } = loadMathJax()

    const adaptor = liteAdaptor()
    RegisterHTMLHandler(adaptor)

    const tex = new TeX({ packages })
    const svg = new SVG({ fontCache: 'none' })

    for (const extension of fontExtensions) svg.addExtension(extension)

    const document = mathjax.document('', { InputJax: tex, OutputJax: svg })
    const css = adaptor.textContent(svg.styleSheet(document) as any)

    mathjaxContext = { adaptor, css, document }
    setMathContext(marpit, (ctx) => ({ ...ctx, mathjaxContext }))
  }

  return mathjaxContext
}

export const inline = (marpit: any) => (tokens, idx) => {
  const { adaptor, document } = context(marpit)
  const { content } = tokens[idx]

  try {
    return adaptor.outerHTML(document.convert(content, { display: false }))
  } catch (e) {
    console.warn(e)
    return content
  }
}

export const block = (marpit: any) =>
  Object.assign(
    (tokens, idx) => {
      const { adaptor, document } = context(marpit)
      const { content } = tokens[idx]

      try {
        const converted = document.convert(content, { display: true })
        const svg: any = adaptor.firstChild(converted)
        const svgHeight = adaptor.getAttribute(svg, 'height')

        adaptor.setStyle(converted, 'margin', '0')
        adaptor.setStyle(svg, 'display', 'block')
        adaptor.setStyle(svg, 'width', '100%')
        adaptor.setStyle(svg, 'height', 'auto')
        adaptor.setStyle(svg, 'max-height', svgHeight)

        return `<p>${adaptor.outerHTML(converted)}</p>`
      } catch (e) {
        console.warn(e)
        return `<p>${content}</p>`
      }
    },
    { scaled: true },
  )

export const css = (marpit: any) => context(marpit).css + '\n' + mathjaxScss
