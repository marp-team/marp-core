import type MarkdownIt from 'markdown-it'
import type { Marp } from './marp'

export type MarpPlugin<Params extends unknown[] = []> = (
  this: MarpPlugin<Params>,
  md: MarkdownIt & { marpit: Marp },
  ...params: Params
) => void

export function marpPlugin<Params extends unknown[]>(
  plugin: MarpPlugin<Params>,
) {
  const generatedPlugin: MarpPlugin<Params> = function (this, md, ...params) {
    if ('marpit' in md && md.marpit) return plugin.call(plugin, md, ...params)

    throw new Error(
      'Marp plugin has detected incompatible markdown-it instance.',
    )
  }

  // Return generated plugin as a compatible type with markdown-it plugin
  return generatedPlugin as (md: MarkdownIt, ...params: Params) => void
}
