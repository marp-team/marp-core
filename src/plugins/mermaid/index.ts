import { marpPlugin } from '../../plugin'
import css from './mermaid.scss?inline'
import { beautifulMermaid } from '#marp-mermaid'

export interface MermaidRenderOptions {
  interactive: boolean
}

export const mermaidMarpCorePlugin = () => {
  const render = (
    mermaid: string,
    { interactive }: MermaidRenderOptions,
  ): string =>
    beautifulMermaid(mermaid, {
      transparent: true,
      padding: 4,
      interactive,
      bg: 'var(--marp-mermaid-background, var(--marp-shiki-background))',
      fg: 'var(--marp-mermaid-foreground, var(--marp-shiki-foreground))',
      line: 'var(--marp-mermaid-line)',
      accent: 'var(--marp-mermaid-accent, var(--marp-shiki-token-keyword))',
      muted: 'var(--marp-mermaid-muted, var(--marp-shiki-token-comment))',
      surface: 'var(--marp-mermaid-surface, var(--marp-shiki-background))',
      border: 'var(--marp-mermaid-border)',
    })

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
      const [, attrs] = parseInfo(token.info)

      try {
        const svg = render(token.content, {
          interactive: /\binteractive\b/.test(attrs),
        }).replace(/^<svg\b/, '<svg data-marp-mermaid')

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
