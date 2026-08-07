import type { renderMermaidSVG } from 'beautiful-mermaid'

export const beautifulMermaid: typeof renderMermaidSVG = (...args) => {
  const bm =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('#marp-beautiful-mermaid') as typeof import('beautiful-mermaid')

  return bm.renderMermaidSVG(...args)
}
