import marpitPlugin from '@marp-team/marpit/plugin'
import { fittingCodePlugin } from './fitting-code'
import { fittingHeaderPlugin } from './fitting-header'
import { fittingMathPlugin } from './fitting-math'
import fittingCSS from './fitting.scss'
import { Marp } from '../marp'

export const css = fittingCSS

export const markdown = marpitPlugin((md) => {
  const marp: Marp = md.marpit
  if (!marp.options.inlineSVG) return

  md.use(fittingCodePlugin).use(fittingHeaderPlugin).use(fittingMathPlugin)
})
