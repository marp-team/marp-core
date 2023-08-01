import marpitPlugin from '@marp-team/marpit/plugin'
import { isEnabledAutoScaling } from './utils'

export const fittingHeaderPlugin = marpitPlugin((md) => {
  const { heading_open } = md.renderer.rules

  md.core.ruler.after('inline', 'marp_fitting_header', ({ tokens }) => {
    if (!md.marpit.options.inlineSVG) return

    let target: any = undefined

    for (const token of tokens) {
      if (!target && token.type === 'heading_open') target = token

      if (target) {
        if (token.type === 'inline') {
          let autoScalingRequired = false

          for (const t of token.children) {
            if (t.type === 'marpit_comment' && t.content === 'fit') {
              autoScalingRequired = true

              t.meta = t.meta || {}
              t.meta.marpitCommentParsed = 'marp-fitting-header'
            }
          }

          if (autoScalingRequired) {
            target.meta = target.meta || {}
            target.meta.marpAutoScaling = true
          }
        } else if (token.type === 'heading_close') {
          target = undefined
        }
      }
    }
  })

  md.renderer.rules.heading_open = function (
    tokens: any,
    idx: any,
    options: any,
    env: any,
    self: any,
  ) {
    const rendered = heading_open
      ? heading_open.call(this, tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)

    const { tag, meta } = tokens[idx]

    if (
      meta?.marpAutoScaling &&
      isEnabledAutoScaling(md.marpit, 'fittingHeader')
    ) {
      return rendered.replace(
        new RegExp(`<${tag}`, 'i'),
        `<${tag} is="marp-${tag}" data-auto-scaling`,
      )
    }

    return rendered
  }
})
