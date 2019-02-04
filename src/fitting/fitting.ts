import fittingCSS from './fitting.scss'
import { Marp } from '../marp'
import { marpEnabledSymbol } from '../symbol'

export const css = fittingCSS
export const attr = 'data-marp-fitting'
export const code = 'data-marp-fitting-code'
export const math = 'data-marp-fitting-math'
export const svgContentAttr = 'data-marp-fitting-svg-content'
export const svgContentWrapAttr = 'data-marp-fitting-svg-content-wrap'

export type ThemeResolver = () => string | undefined

function wrapTokensByFittingToken(token, tokens: any[]): any[] {
  const open = new token('marp_fitting_open', 'span', 1)
  open.attrSet(attr, 'plain')

  return [open, ...tokens, new token('marp_fitting_close', 'span', -1)]
}

// Wrap code block and fence renderer by fitting elements.
function fittingCode(md, marp: Marp, themeResolver: ThemeResolver): void {
  const { code_block, fence } = md.renderer.rules

  const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

  const replacedRenderer = func => (...args) => {
    const rendered: string = func(...args)
    if (!md[marpEnabledSymbol]) return rendered

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
function fittingHeader(md, marp: Marp): void {
  md.core.ruler.after('inline', 'marp_fitting_header', state => {
    let target = undefined

    for (const token of state.tokens) {
      if (!target && token.type === 'heading_open') target = token

      if (target) {
        if (token.type === 'inline') {
          let requireWrapping = false

          for (const t of token.children) {
            if (t.type === 'marpit_comment' && t.content === 'fit') {
              requireWrapping = true
              t.meta = t.meta || {}
              t.meta.marpitCommentParsed = 'marp-fitting-header'
            }
          }

          if (requireWrapping) {
            token.children = wrapTokensByFittingToken(
              state.Token,
              token.children
            )
          }
        } else if (token.type === 'heading_close') {
          target = undefined
        }
      }
    }
  })

  if (marp.options.inlineSVG) {
    Object.assign(md.renderer.rules, {
      marp_fitting_open: () =>
        `<svg ${attr}="svg"><foreignObject><span ${svgContentAttr}>`,
      marp_fitting_close: () => '</span></foreignObject></svg>',
    })
  }
}

function fittingMathBlock(md, marp: Marp): void {
  const { marp_math_block } = md.renderer.rules
  if (!marp_math_block) return

  const replacedRenderer = func => (...args) => {
    const rendered: string = func(...args)
    if (!md[marpEnabledSymbol]) return rendered

    // Rendered math block is wrapped by `<p>` tag in math plugin
    const katex = rendered.slice(3, -4)

    if (marp.options.inlineSVG) {
      return [
        `<p><svg ${attr}="svg" ${math}><foreignObject>`,
        `<span ${svgContentAttr}><span ${svgContentWrapAttr}>`,
        katex,
        `</span></span></foreignObject></svg></p>`,
      ].join('')
    }
    return `<p><span ${attr}="plain">${katex}</span></p>`
  }

  md.renderer.rules.marp_math_block = replacedRenderer(marp_math_block)
}

export function markdown(md, marp: Marp, themeResolver: ThemeResolver): void {
  md.use(fittingHeader, marp)
  md.use(fittingCode, marp, themeResolver)
  md.use(fittingMathBlock, marp)
}
