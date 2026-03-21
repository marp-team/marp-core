import { shikiTheme } from '../shiki'
import { getBeautifulMermaid } from './loader'

export const render = (diagram: string): string => {
  const { fromShikiTheme, renderMermaidSVG } = getBeautifulMermaid()
  const colors = fromShikiTheme(shikiTheme())

  return renderMermaidSVG(diagram, { ...colors, transparent: true, padding: 0 })
}
