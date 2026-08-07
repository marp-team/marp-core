import { marpPlugin } from '../plugin'
import { codeBlockPlugin } from './code-block'
import { fittingHeaderPlugin } from './fitting-header'

export const markdown = marpPlugin((md) =>
  md.use(fittingHeaderPlugin).use(codeBlockPlugin),
)
