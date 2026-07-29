import { marpPlugin } from '../../plugin'
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

  return marpPlugin(({ marpit: marp }) => {
    const originalDiagramRenderer = marp.diagramRenderer.bind(marp)

    marp.diagramRenderer = (code: string, lang: string, attrs: string) => {
      if (lang === 'mermaid') {
        try {
          return render(code, { interactive: /\binteractive\b/.test(attrs) })
        } catch (err) {
          console.warn(err)
        }
      }
      return originalDiagramRenderer(code, lang, attrs)
    }
  })
}

export default mermaidMarpCorePlugin
