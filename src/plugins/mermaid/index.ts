import type { RenderOptions } from 'pele'
import { marpPlugin } from '../../plugin'
import css from './mermaid.scss?inline'
import { pele } from '#marp-mermaid'

export type MermaidMarpCorePluginOptions = Pick<
  RenderOptions,
  'measurer' | 'links' | 'images' | 'linkSchemes' | 'imageSchemes'
>

export const mermaidMarpCorePlugin = ({
  measurer,
  links,
  images,
  linkSchemes,
  imageSchemes,
}: MermaidMarpCorePluginOptions = {}) => {
  return marpPlugin((md) => {
    const parseInfo = (info: string): [lang: string, attrs: string] => {
      const normalized = md.utils.unescapeAll(info).trim()
      const [lang = ''] = normalized.split(/\s+/, 1)

      return [lang, normalized.slice(lang.length).trim()]
    }

    md.core.ruler.after('block', 'marp_mermaid', ({ tokens }) => {
      for (const token of tokens || []) {
        if (
          token.type === 'fence' &&
          parseInfo(token.info || '')[0] === 'mermaid'
        ) {
          token.type = 'marp_mermaid'
          token.tag = 'svg'
        }
      }
    })

    md.renderer.rules.marp_mermaid = (tokens, idx, options, env, self) => {
      const token = tokens[idx]

      try {
        const { svg } = pele(token.content, {
          measurer,
          links,
          images,
          linkSchemes,
          imageSchemes,
          autoDirection: false,
          padding: 4,
          responsive: false,
        })

        return `<p>${svg}</p>\n`
      } catch (err) {
        console.warn(err)
        return self.rules.fence!(tokens, idx, options, env, self)
      }
    }

    const marp = md.marpit as any
    const { themeSetPackOptions } = marp

    marp.themeSetPackOptions = function (...args) {
      const base = themeSetPackOptions.apply(this, args)
      base.before = css + '\n' + (base.before || '')
      return base
    }
  })
}

export default mermaidMarpCorePlugin
