import { mathjax } from 'mathjax-full/js/mathjax'
import { TeX } from 'mathjax-full/js/input/tex'
import { SVG } from 'mathjax-full/js/output/svg'
import { liteAdaptor, LiteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages'

interface MathJaxContext {
  adaptor: LiteAdaptor
  css: string
  document: ReturnType<typeof mathjax['document']>
}

let lazyContext: MathJaxContext | undefined

const context = (): MathJaxContext => {
  if (!lazyContext) {
    const adaptor = liteAdaptor()
    RegisterHTMLHandler(adaptor)

    const tex = new TeX({ packages: AllPackages })
    const svg = new SVG({ fontCache: 'none' })
    const document = mathjax.document('', { InputJax: tex, OutputJax: svg })
    const css = adaptor.textContent(svg.styleSheet(document) as any)

    lazyContext = { adaptor, css, document }
  }
  return lazyContext
}

export const inline = () => (tokens, idx) => {
  const { adaptor, document } = context()
  const { content } = tokens[idx]

  try {
    return adaptor.outerHTML(document.convert(content, { display: false }))
  } catch (e) {
    console.warn(e)
    return content
  }
}

export const block = () =>
  Object.assign(
    (tokens, idx) => {
      const { adaptor, document } = context()
      const { content } = tokens[idx]

      try {
        const converted = document.convert(content, { display: false })
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
    { scaled: true }
  )

export const css = () => context().css
