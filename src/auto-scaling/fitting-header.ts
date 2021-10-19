import marpitPlugin from '@marp-team/marpit/plugin'

export const fittingHeaderPlugin = marpitPlugin((md) => {
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
            target.attrSet('is', `marp-${target.tag}`)
            target.attrSet('data-auto-scaling', '')
          }
        } else if (token.type === 'heading_close') {
          target = undefined
        }
      }
    }
  })
})
