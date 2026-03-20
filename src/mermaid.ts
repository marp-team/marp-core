import { renderMermaidSVG, fromShikiTheme } from 'beautiful-mermaid'
import { shikiTheme } from './shiki'

export const render = (diagram: string): string => {
  const colors = fromShikiTheme(shikiTheme())

  return renderMermaidSVG(diagram, { ...colors, transparent: true, padding: 0 })
}
