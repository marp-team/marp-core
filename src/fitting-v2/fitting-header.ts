import marpitPlugin from '@marp-team/marpit/plugin'
import { fittingContentAttr, fittingElementAttr } from './attrs'

// Detect `<!-- fit -->` comment keyword in headings
export const fittingHeaderPlugin = marpitPlugin((md) => {
  md.core.ruler.after('inline', 'marp_core_fitting_header', (state) => {
    let target = undefined

    for (const token of state.tokens) {
      if (!target && token.type === 'heading_open') target = token

      if (target) {
        if (token.type === 'inline') {
          let requireWrapping = false

          for (const t of token.children) {
            if (t.type === 'marpit_comment' && t.content === 'fit') {
              requireWrapping = true

              // Mark as parsed to prevent collecting for presenter notes
              t.meta = t.meta || {}
              t.meta.marpitCommentParsed = fittingElementAttr
            }
          }

          if (requireWrapping) {
            const open = new state.Token('marp_fitting_header_open', 'span', 1)

            token.children = [
              open,
              ...token.children,
              new state.Token('marp_fitting_header_close', 'span', -1),
            ]
          }
        } else if (token.type === 'heading_close') {
          target = undefined
        }
      }
    }
  })

  md.renderer.rules.marp_fitting_header_open = () =>
    `<span ${fittingElementAttr}><span ${fittingContentAttr}>`

  md.renderer.rules.marp_fitting_header_close = () => '</span></span>'
})
