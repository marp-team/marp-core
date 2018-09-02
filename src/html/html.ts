import { MarpOptions } from '../marp'

export function markdown(md, opts: MarpOptions['html']): void {
  if (typeof opts === 'object') {
    // TODO: Override html_block render to process sanitize-html
  }
}
