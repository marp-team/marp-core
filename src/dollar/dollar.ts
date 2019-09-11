import marpitPlugin from '@marp-team/marpit/lib/markdown/marpit_plugin'
import { Marp } from '../marp'

// TODO: Remove dollar prefix support after making be known deprecation to user of GUI tools like Marp for VS Code
export const markdown = marpitPlugin(({ marpit: marp }: { marpit: Marp }) => {
  if (!marp.options.dollarPrefixForGlobalDirectives) return

  marp.customDirectives.global.$theme = v => ({ theme: v })
  marp.customDirectives.global.$style = v => ({ style: v })
  marp.customDirectives.global.$headingDivider = v => ({ headingDivider: v })
})
