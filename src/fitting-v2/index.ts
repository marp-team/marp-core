import marpitPlugin from '@marp-team/marpit/plugin'
import { fittingAttr } from './attrs'
import { fittingCodePlugin } from './fitting-code'
import { fittingHeaderPlugin } from './fitting-header'
import { fittingMathPlugin } from './fitting-math'
import fittingCSS from './fitting.scss'
import { Marp } from '../marp'

export const css = fittingCSS

const generateAutoScalingDetector = (marp: Marp) => {
  const { theme } = marp['lastGlobalDirectives'] || {}
  const instance = marp.themeSet.get(theme, true)
  const meta = instance && marp.themeSet.getThemeMeta(instance, 'auto-scaling')

  return (k?: string) => !!(meta?.includes('true') || (k && meta?.includes(k)))
}

const fittingSetAttrPlugin = marpitPlugin((md) => {
  const marp: Marp = md.marpit

  md.core.ruler.after(
    'marpit_slide',
    'marp_core_fitting_v2_attr',
    ({ inlineMode, tokens }) => {
      if (inlineMode) return

      const v: string[] = []
      const isEnabled = generateAutoScalingDetector(marp)

      if (isEnabled('code')) v.push('code')
      if (isEnabled('math')) v.push('math')
      if (isEnabled('header') || isEnabled('fittingHeader')) v.push('header')

      const attrValue = v.join(' ')
      if (!attrValue) return

      for (const token of tokens) {
        if (token.meta?.marpitSlideElement === 1) {
          token.attrSet(fittingAttr, attrValue)
        }
      }
    }
  )
})

export const markdown = marpitPlugin((md) => {
  const marp: Marp = md.marpit
  if (!marp.options.inlineSVG) return

  md.use(fittingSetAttrPlugin)
    .use(fittingCodePlugin)
    .use(fittingHeaderPlugin)
    .use(fittingMathPlugin)
})
