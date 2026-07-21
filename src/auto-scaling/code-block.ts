import type MarkdownIt from 'markdown-it'
import { marpPlugin } from '../plugin'
import { isEnabledAutoScaling } from './utils'

type RenderRule = NonNullable<MarkdownIt['renderer']['rules'][string]>

const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

export const codeBlockPlugin = marpPlugin((md) => {
  const { code_block, fence } = md.renderer.rules

  const replacedRenderer =
    (func: RenderRule): RenderRule =>
    (tokens, idx, options, env, self) => {
      const rendered = func(tokens, idx, options, env, self)
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

  // markdown-it has default renderer rules for code_block and fence, so we can treat them as non-nullable
  // https://github.com/markdown-it/markdown-it/blob/a6d1d484e521ec37a671ae4d07c09169f9a8f9af/lib/renderer.mjs#L21
  // https://github.com/markdown-it/markdown-it/blob/a6d1d484e521ec37a671ae4d07c09169f9a8f9af/lib/renderer.mjs#L29
  md.renderer.rules.code_block = replacedRenderer(code_block!)
  md.renderer.rules.fence = replacedRenderer(fence!)
})
