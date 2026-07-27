import { createCssVariablesTheme } from 'shiki/core'

// Shiki theme
// It's shared by shiki plugin and mermaid plugin so should export as a separate and bundled module.
export const name = 'marp-shiki' as const
export const theme = createCssVariablesTheme({
  name,
  variablePrefix: '--marp-shiki-',
})
