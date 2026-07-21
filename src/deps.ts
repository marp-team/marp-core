type DepsLoader = typeof import('./_deps-loader')

// Bypass static analysis and keep the ESM-only loader as a separate bundle.
const requireLoader: NodeJS.Require = require

let depsLoader: DepsLoader | undefined

export const getDepsLoader = (): DepsLoader => {
  if (!depsLoader) {
    depsLoader = requireLoader('./_deps-loader.mjs') as DepsLoader
  }

  return depsLoader
}
