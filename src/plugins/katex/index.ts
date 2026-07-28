import type { KatexOptions } from 'katex'
import { isEnabledAutoScaling } from '../../auto-scaling/utils'
import { getMathLibrary, registerMathLibrary } from '../../math/context'
import type { MathLibraryObject } from '../../math/context'
import { normalizeMathOptions } from '../../math/options'
import { marpPlugin } from '../../plugin'
import katexScss from './katex.scss?inline'
import { katex } from '#marp-katex'

export interface KaTeXMarpCorePluginOptions {
  options?: KatexOptions
  fontPath?: string | false
}

export const katexMarpCorePlugin = ({
  options,
  fontPath,
}: KaTeXMarpCorePluginOptions = {}) => {
  const katexUrlMatcher = /url\(['"]?fonts\/(.*?)['"]?\)/g

  return marpPlugin(({ marpit: marp }) => {
    const getKaTeXOptions = () => {
      if (options) return options

      const opts = normalizeMathOptions(marp.options.math)
      return (opts && (opts.katexOption as KatexOptions)) || undefined
    }

    const render: typeof katex.renderToString = (tex, opts) => {
      const lib = getMathLibrary(marp, 'katex') as MathLibraryObject<{
        macros?: KatexOptions['macros']
      }>

      return katex.renderToString(tex, {
        throwOnError: false,
        ...getKaTeXOptions(),
        macros: lib?.context?.macros || {},
        ...opts,
      })
    }

    registerMathLibrary(marp, 'katex', {
      css: (marp) => {
        const fontPathOption =
          fontPath ??
          (() => {
            const opts = normalizeMathOptions(marp.options.math)
            return (opts && opts.katexFontPath) ?? undefined
          })()

        if (fontPathOption === false) return katexScss

        const newFontPath =
          fontPathOption ||
          `https://cdn.jsdelivr.net/npm/katex@${katex.version}/dist/fonts/`

        return katexScss.replace(
          katexUrlMatcher,
          (_, matched) => `url('${newFontPath}${matched}')`,
        )
      },
      inlineRenderer: () => (tokens, idx) => {
        const { content } = tokens[idx]

        try {
          return render(content, { displayMode: false })
        } catch (e) {
          console.warn(e)
          return content
        }
      },
      blockRenderer: () => (tokens, idx) => {
        const { content } = tokens[idx]

        try {
          let rendered = render(content, { displayMode: true })

          if (marp.options.inlineSVG && isEnabledAutoScaling(marp, 'math')) {
            rendered = rendered.replace(
              /^<span/i,
              '<span is="marp-span" data-auto-scaling="downscale-only"',
            )
          }

          return `<p>${rendered}</p>`
        } catch (e) {
          console.warn(e)
          return `<p>${content}</p>`
        }
      },
      initializeContext: () => ({
        macros: { ...getKaTeXOptions()?.macros },
      }),
    })
  })
}

export default katexMarpCorePlugin
