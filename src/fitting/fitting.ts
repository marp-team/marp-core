import Token from 'markdown-it/lib/token'
export { default as css } from './fitting.scss'

export const attr = 'data-marp-fitting'
export const svgContentAttr = 'data-marp-fitting-svg-content'

function wrapTokensByFittingToken(tokens: any[]): any[] {
  const open = new Token('marp_fitting_open', 'span', 1)
  open.attrSet(attr, 'plain')

  return [open, ...tokens, new Token('marp_fitting_close', 'span', -1)]
}

/**
 * Detect `<!-- fit -->` comment keyword in headings.
 */
function fittingHeader(md): void {
  md.core.ruler.after('inline', 'marp_fitting_header', state => {
    let target = undefined

    state.tokens.forEach(token => {
      if (!target && token.type === 'heading_open') target = token
      if (target === undefined) return
      if (
        token.type === 'inline' &&
        token.children.some(
          t => t.type === 'marpit_comment' && t.content === 'fit'
        )
      ) {
        token.children = wrapTokensByFittingToken(token.children)
      } else if (token.type === 'heading_close') {
        target = undefined
      }
    })
  })
}

export function markdown(md, opts: { inlineSVG: boolean }): void {
  md.use(fittingHeader)

  if (opts.inlineSVG) {
    Object.assign(md.renderer.rules, {
      marp_fitting_open: () =>
        `<svg ${attr}="svg"><foreignObject><span ${svgContentAttr}>`,
      marp_fitting_close: () => '</span></foreignObject></svg>',
    })
  }
}
