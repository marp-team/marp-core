import marpitPlugin from '@marp-team/marpit/plugin'
import { fittingContentAttr, fittingElementAttr } from './attrs'

const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

export const fittingCodePlugin = marpitPlugin((md) => {
  const { code_block, fence } = md.renderer.rules

  const replacedRenderer = (func) => (...args) => {
    const rendered: string = func(...args)

    return rendered.replace(
      codeMatcher,
      (_, start, content, end) =>
        `${start}<span ${fittingElementAttr}><span ${fittingContentAttr}>${content}</span></span>${end}`
    )
  }

  md.renderer.rules.code_block = replacedRenderer(code_block)
  md.renderer.rules.fence = replacedRenderer(fence)
})
