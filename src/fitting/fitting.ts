import marpitPlugin from '@marp-team/marpit/lib/markdown/marpit_plugin'
import fittingCSS from './fitting.scss'
import Marp from '../marp'

export const css = fittingCSS
export const attr = 'data-marp-fitting'
export const code = 'data-marp-fitting-code'
export const math = 'data-marp-fitting-math'
export const svgContentAttr = 'data-marp-fitting-svg-content'
export const svgContentWrapAttr = 'data-marp-fitting-svg-content-wrap'

const codeMatcher = /^(<pre[^>]*?><code[^>]*?>)([\s\S]*)(<\/code><\/pre>\n*)$/

const isEnabledAutoScaling = (marp: Marp, key?: string): boolean => {
  const { lastGlobalDirectives } = marp as any
  const theme = marp.themeSet.get((lastGlobalDirectives || {}).theme, true)

  const meta =
    theme &&
    (marp.themeSet.getThemeMeta(theme, 'auto-scaling') as string | undefined)

  return !!(meta === 'true' || (key && (meta || '').includes(key)))
}

// Wrap code block and fence renderer by fitting elements.
function fittingCode(md): void {
  const { code_block, fence } = md.renderer.rules

  const replacedRenderer = func => (...args) => {
    const rendered: string = func(...args)

    if (isEnabledAutoScaling(md.marpit, 'code')) {
      return rendered.replace(codeMatcher, (_, start, content, end) => {
        if (md.marpit.options.inlineSVG) {
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

    return rendered
  }

  md.renderer.rules.code_block = replacedRenderer(code_block)
  md.renderer.rules.fence = replacedRenderer(fence)
}

// Detect `<!-- fit -->` comment keyword in headings.
function fittingHeader(md): void {
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
            const open = new state.Token('marp_fitting_open', 'span', 1)
            open.attrSet(attr, 'plain')

            token.children = [
              open,
              ...token.children,
              new state.Token('marp_fitting_close', 'span', -1),
            ]
          }
        } else if (token.type === 'heading_close') {
          target = undefined
        }
      }
    }
  })

  md.renderer.rules.marp_fitting_open = () =>
    isEnabledAutoScaling(md.marpit, 'fittingHeader')
      ? md.marpit.options.inlineSVG
        ? `<svg ${attr}="svg"><foreignObject><span ${svgContentAttr}>`
        : `<span ${attr}="plain">`
      : ''

  md.renderer.rules.marp_fitting_close = () =>
    isEnabledAutoScaling(md.marpit, 'fittingHeader')
      ? `</span>${md.marpit.options.inlineSVG ? '</foreignObject></svg>' : ''}`
      : ''
}

function fittingMathBlock(md): void {
  const { marp_math_block } = md.renderer.rules
  if (!marp_math_block) return

  md.renderer.rules.marp_math_block = (...args) => {
    // Rendered math block is wrapped by `<p>` tag in math plugin
    const rendered: string = marp_math_block(...args)

    if (isEnabledAutoScaling(md.marpit, 'math')) {
      const katex = rendered.slice(3, -4)

      if (md.marpit.options.inlineSVG) {
        return [
          `<p><svg ${attr}="svg" ${math}><foreignObject>`,
          `<span ${svgContentAttr}><span ${svgContentWrapAttr}>`,
          katex,
          `</span></span></foreignObject></svg></p>`,
        ].join('')
      }
      return `<p><span ${attr}="plain">${katex}</span></p>`
    }

    return rendered
  }
}

export const markdown = marpitPlugin(md => {
  md.use(fittingHeader)
    .use(fittingCode)
    .use(fittingMathBlock)
})
