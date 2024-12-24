import { renderToString } from 'katex'
import { version } from 'katex/package.json'
import { isEnabledAutoScaling } from '../auto-scaling/utils'
import { getMathContext } from './context'
import katexScss from './katex.scss'

const convertedCSS = Object.create(null)
const katexMatcher = /url\(['"]?fonts\/(.*?)['"]?\)/g

export const inline = (marpit: any) => (tokens, idx) => {
  const { content } = tokens[idx]
  const {
    options: { katexOption },
    katexMacroContext,
  } = getMathContext(marpit)

  try {
    return renderToString(content, {
      throwOnError: false,
      ...(katexOption || {}),
      macros: katexMacroContext,
      displayMode: false,
    })
  } catch (e) {
    console.warn(e)
    return content
  }
}

export const block = (marpit: any) => (tokens, idx) => {
  const { content } = tokens[idx]
  const {
    options: { katexOption },
    katexMacroContext,
  } = getMathContext(marpit)

  try {
    let rendered = renderToString(content, {
      throwOnError: false,
      ...(katexOption || {}),
      macros: katexMacroContext,
      displayMode: true,
    })

    if (marpit.options.inlineSVG && isEnabledAutoScaling(marpit, 'math')) {
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
}

export const css = (path?: string | false): string => {
  if (path === false) return katexScss

  const fontPath =
    path || `https://cdn.jsdelivr.net/npm/katex@${version}/dist/fonts/`

  return (convertedCSS[fontPath] =
    convertedCSS[fontPath] ||
    katexScss.replace(
      katexMatcher,
      (_, matched) => `url('${fontPath}${matched}')`,
    ))
}
