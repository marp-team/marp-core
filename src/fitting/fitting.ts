import Token from 'markdown-it/lib/token'

export const css = `
svg[data-marp-fitting-header="svg"] {
  display: block;
}
svg[data-marp-fitting-header="svg"].__reflow__ {
  content: '';
}
[data-marp-fitting-header-svg-content] {
  display: table;
  white-space: nowrap;
}
[data-marp-fitting-header-svg-content] [data-marpit-emoji] {
  filter: none;
}
`.trim()

export function markdown(md, opts: { inlineSVG: boolean }): void {
  md.core.ruler.after('inline', 'marp_fitting_header', state => {
    let target = undefined

    state.tokens.forEach(token => {
      if (!target && token.type === 'heading_open') {
        target = token
      } else if (target !== undefined) {
        if (
          token.type === 'inline' &&
          token.children.some(
            t => t.type === 'marpit_comment' && t.content === 'fit'
          )
        ) {
          const openingToken = new Token('marp_fitting_header_open', 'span', 1)
          openingToken.attrSet('data-marp-fitting-header', 'plain')

          token.children = [
            openingToken,
            ...token.children,
            new Token('marp_fitting_header_close', 'span', -1),
          ]
        } else if (token.type === 'heading_close') {
          target = undefined
        }
      }
    })

    if (opts.inlineSVG) {
      md.renderer.rules.marp_fitting_header_open = () =>
        '<svg data-marp-fitting-header="svg"><foreignObject><span data-marp-fitting-header-svg-content>'

      md.renderer.rules.marp_fitting_header_close = () =>
        '</span></foreignObject></svg>'
    }
  })
}
