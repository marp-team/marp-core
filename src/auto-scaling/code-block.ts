import type MarkdownIt from 'markdown-it'
import { marpPlugin } from '../plugin'
import { isEnabledAutoScaling } from './utils'

const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

export const codeBlockPlugin = marpPlugin((md) => {
  const { code_block, fence } = md.renderer.rules

  const replacedRenderer =
    (func?: MarkdownIt.Renderer.RenderRule): MarkdownIt.Renderer.RenderRule =>
    (tokens, idx, options, env, self) => {
      const rendered = func
        ? func(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options)

      const shouldScale =
        md.marpit.options.inlineSVG && isEnabledAutoScaling(md.marpit, 'code')

      if (!shouldScale) return rendered

      return rendered.replace(
        codeMatcher,
        (_, start, content, end) =>
          '<pre is="marp-pre" data-auto-scaling="downscale-only"' +
          start.slice(4) +
          content +
          end,
      )
    }

  md.renderer.rules.code_block = replacedRenderer(code_block)
  md.renderer.rules.fence = replacedRenderer(fence)
})
