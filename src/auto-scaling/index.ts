import marpitPlugin from '@marp-team/marpit/plugin'
import { codeBlockPlugin } from './code-block'
import { fittingHeaderPlugin } from './fitting-header'

export const markdown = marpitPlugin((md) =>
  md.use(fittingHeaderPlugin).use(codeBlockPlugin),
)
