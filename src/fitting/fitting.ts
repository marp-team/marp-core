import Token from 'markdown-it/lib/token'
import fittingCSS from './fitting.scss'
import { Marp } from '../marp'

export const css = fittingCSS
export const attr = 'data-marp-fitting'
export const code = 'data-marp-fitting-code'
export const svgContentAttr = 'data-marp-fitting-svg-content'
export const svgContentWrapAttr = 'data-marp-fitting-svg-content-wrap'

export type ThemeResolver = () => string | undefined

function wrapTokensByFittingToken(tokens: any[]): any[] {
  const open = new Token('marp_fitting_open', 'span', 1)
  open.attrSet(attr, 'plain')

  return [open, ...tokens, new Token('marp_fitting_close', 'span', -1)]
}

// Wrap code block and fence renderer by fitting elements.
function fittingCode(md, marp: Marp, themeResolver: ThemeResolver): void {
  const { code_block, fence } = md.renderer.rules

  const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

  const replacedRenderer = func => (...args) => {
    const rendered: string = func(...args)
    const { fittingCode } = marp.themeSet.getThemeProp(themeResolver()!, 'meta')

    if (fittingCode === 'false') return rendered

    return rendered.replace(codeMatcher, (_, start, content, end) => {
      if (marp.options.inlineSVG) {
        return [
          `${start}<svg ${attr}="svg" ${code}><foreignObject>`,
          `<span ${svgContentAttr}><span ${svgContentWrapAttr}>`,
          content,
          `</span></span></foreignObject></svg>${end}`,
        ].join('')
      }
      return `${start}<span ${attr}="plain">${content}</span>${end}`
    })
  }

  md.renderer.rules.code_block = replacedRenderer(code_block)
  md.renderer.rules.fence = replacedRenderer(fence)
}

// Detect `<!-- fit -->` comment keyword in headings.
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

export function markdown(md, marp: Marp, themeResolver: ThemeResolver): void {
  md.use(fittingHeader)
  md.use(fittingCode, marp, themeResolver)

  if (marp.options.inlineSVG) {
    Object.assign(md.renderer.rules, {
      marp_fitting_open: () =>
        `<svg ${attr}="svg"><foreignObject><span ${svgContentAttr}>`,
      marp_fitting_close: () => '</span></foreignObject></svg>',
    })
  }
}
