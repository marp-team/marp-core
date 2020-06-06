import katex from 'katex'
import { version } from 'katex/package.json'
import katexScss from './katex.scss'

const convertedCSS = Object.create(null)
const katexMatcher = /url\(['"]?fonts\/(.*?)['"]?\)/g

export const inline = (opts: object = {}) => (tokens, idx) => {
  const { content } = tokens[idx]

  try {
    return katex.renderToString(content, {
      throwOnError: false,
      ...opts,
      displayMode: false,
    })
  } catch (e) {
    console.warn(e)
    return content
  }
}

export const block = (opts: object = {}) => (tokens, idx) => {
  const { content } = tokens[idx]

  try {
    return `<p>${katex.renderToString(content, {
      throwOnError: false,
      ...opts,
      displayMode: true,
    })}</p>`
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
      (_, matched) => `url('${fontPath}${matched}')`
    ))
}
