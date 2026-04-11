let _isSupportedCustomizedBuiltInElements: boolean | undefined

export const isSupportedCustomizedBuiltInElements = () =>
  _isSupportedCustomizedBuiltInElements ??
  (() => {
    _isSupportedCustomizedBuiltInElements = !!document
      .createElement('div', { is: 'marp-auto-scaling' })
      .outerHTML.startsWith('<div is')

    return _isSupportedCustomizedBuiltInElements
  })()
