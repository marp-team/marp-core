import type { View } from '../type'

const cachedResult = new WeakMap<View, boolean>()

export const isSupportedCustomizedBuiltInElements = (view: View) => {
  const cached = cachedResult.get(view)
  if (cached !== undefined) return cached

  const result = !!view.document
    .createElement('div', { is: 'marp-auto-scaling' })
    .outerHTML.startsWith('<div is')

  cachedResult.set(view, result)
  return result
}
