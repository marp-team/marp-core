import { getBeautifulMermaid } from './loader'

export interface MermaidRenderOptions {
  interactive?: boolean
}

export const render = (
  mermaid: string,
  { interactive = false }: MermaidRenderOptions = {},
): string => {
  const { renderMermaidSVG } = getBeautifulMermaid()

  return renderMermaidSVG(mermaid, {
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
}
