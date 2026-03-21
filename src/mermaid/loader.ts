/// <reference types="node" />

// Bypass static analysis of modules and force lazy loading at runtime by ailasing
const requireLoader: NodeJS.Require = require

let _beautifulMermaid: typeof import('beautiful-mermaid') | undefined

export const getBeautifulMermaid = (): typeof import('beautiful-mermaid') => {
  if (!_beautifulMermaid) {
    _beautifulMermaid = requireLoader(
      'beautiful-mermaid',
    ) as typeof import('beautiful-mermaid')
  }
  return _beautifulMermaid
}
