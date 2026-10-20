import type { render } from 'pele'

export const pele: typeof render = (...args) => {
  const peleModule =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('pele') as typeof import('pele')

  return peleModule.render(...args)
}
