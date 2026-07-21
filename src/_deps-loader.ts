// !! Do not import this file directly. Use `./deps` instead.
// !! This file must remain a standalone ESM bundle to use `import.meta.resolve()`.

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

////////// beautiful-mermaid

let beautifulMermaid: typeof import('beautiful-mermaid') | undefined

// If a following issue was fixed, I could have just used `require('beautiful-mermaid')` in the parent...
// https://github.com/lukilabs/beautiful-mermaid/issues/73
// https://github.com/lukilabs/beautiful-mermaid/pull/74
export const getBeautifulMermaid = (): typeof import('beautiful-mermaid') => {
  if (!beautifulMermaid) {
    beautifulMermaid = require(
      fileURLToPath(import.meta.resolve('beautiful-mermaid')),
    )
  }
  return beautifulMermaid!
}

////////// shiki

// TODO: Load `shiki` lazily like `beautiful-mermaid` to reduce the bundle size of Marp Core.
