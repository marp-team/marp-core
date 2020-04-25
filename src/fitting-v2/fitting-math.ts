import marpitPlugin from '@marp-team/marpit/plugin'
import { fittingContentAttr, fittingElementAttr } from './attrs'

export const fittingMathPlugin = marpitPlugin((md) => {
  const { marp_math_block } = md.renderer.rules

  if (!marp_math_block) {
    console.warn('[Fitting plugin] Marp Core math plugin is not loaded.')
    return
  }

  md.renderer.rules.marp_math_block = (...args) => {
    const rendered: string = marp_math_block(...args)

    // Rendered math block is wrapped by `<p>` tag in math plugin
    const katex = rendered.slice(3, -4)

    return `<p><span ${fittingElementAttr}="math"><span ${fittingContentAttr}>${katex}</span></span></p>`
  }
})
