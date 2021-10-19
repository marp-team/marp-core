import marpitPlugin from '@marp-team/marpit/plugin'

const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

export const codeBlockPlugin = marpitPlugin((md) => {
  const { code_block, fence } = md.renderer.rules

  const replacedRenderer =
    (func: (...args: any[]) => string) =>
    (...args: any[]) => {
      const rendered = func(...args)

      if (
        md.marpit.options
          .inlineSVG /* && isEnabledAutoScaling(md.marpit, 'code') */
      ) {
        return rendered.replace(
          codeMatcher,
          (_, start, content, end) =>
            '<pre is="marp-pre" data-auto-scaling="downscale-only"' +
            start.slice(4) +
            content +
            end
        )
      }

      return rendered
    }

  md.renderer.rules.code_block = replacedRenderer(code_block)
  md.renderer.rules.fence = replacedRenderer(fence)
})
