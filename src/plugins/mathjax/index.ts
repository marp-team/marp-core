import { getMathLibrary, registerMathLibrary } from '../../math/context'
import type { MathLibraryObject } from '../../math/context'
import { marpPlugin } from '../../plugin'
import mathJaxScss from './mathjax.scss?inline'
import { mathjax } from '#marp-mathjax'

type MathJax = ReturnType<typeof mathjax>

interface MathJaxContext {
  css?: string
  document?: ReturnType<MathJax['handler']['create']>
}

export const mathJaxMarpCorePlugin = () => {
  return marpPlugin((md) => {
    const { marpit: marp } = md

    const fallback = (tokens, idx) => {
      const { content, markup } = tokens[idx]
      return md.utils.escapeHtml(`${markup}${content}${markup}`)
    }

    const getContext = () => {
      const lib = getMathLibrary(
        marp,
        'mathjax',
      ) as MathLibraryObject<MathJaxContext>
      const { adaptor, fontExtensions, handler, packages, SVG, TeX } = mathjax()

      let { css, document } = lib.context

      if (!document) {
        const tex = new TeX({ packages })
        const svg = new SVG({ fontCache: 'none' })

        for (const fontExt of fontExtensions) svg.addExtension(fontExt)

        document = handler.create('', { InputJax: tex, OutputJax: svg })
        css = adaptor.textContent(svg.styleSheet(document) as any)

        lib.context.document = document
        lib.context.css = css
      }

      return { adaptor, css: css!, document }
    }

    registerMathLibrary(marp, 'mathjax', {
      inlineRenderer: () => (tokens, idx) => {
        const { adaptor, document } = getContext()
        const { content } = tokens[idx]

        try {
          return adaptor.outerHTML(
            document.convert(content, { display: false }),
          )
        } catch (e) {
          console.warn(e)
          return fallback(tokens, idx)
        }
      },
      blockRenderer: () => (tokens, idx) => {
        const { adaptor, document } = getContext()
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
          return `<p>${fallback(tokens, idx)}</p>`
        }
      },
      css: () => getContext().css + '\n' + mathJaxScss,
      initializeContext: (): MathJaxContext => ({}),
    })
  })
}

export default mathJaxMarpCorePlugin
