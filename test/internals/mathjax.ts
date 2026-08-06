/* eslint-disable import-x/no-duplicates */
import * as marpMathJaxBase from '../../src/internals/mathjax'
import * as marpMathJaxNode from '../../src/internals/mathjax.node'
import * as marpMathJax from '#marp-mathjax'

describe('#marp-mathjax', () => {
  it('exports src/internals/mathjax', () => {
    expect(marpMathJax).toStrictEqual(marpMathJaxBase)
    expect(marpMathJax.mathjax()).toBe(marpMathJaxBase.mathjax())
  })
})

describe('#marp-mathjax for Node.js', () => {
  it('has same interface with #marp-mathjax', () => {
    expect(Object.keys(marpMathJaxNode)).toStrictEqual(Object.keys(marpMathJax))
  })

  it('requires MathJax lazily only when used', async () => {
    const mockMathJaxModule = jest.fn()
    const mockAdaptor = {}
    const mockHandler = {}
    const mockSVG = jest.fn()
    const mockTeX = jest.fn()
    const mockLiteAdaptor = jest.fn(() => mockAdaptor)
    const mockRegisterHTMLHandler = jest.fn(() => mockHandler)
    const mockLoadTexPackages = jest.fn(() => ({
      packages: ['mock-package'],
      fontExtensions: [],
    }))

    const mocks: [string, jest.Mock][] = [
      [
        '@mathjax/src/mjs/mathjax.js',
        jest.fn(() => ({ mathjax: mockMathJaxModule })),
      ],
      [
        '@mathjax/src/mjs/adaptors/liteAdaptor.js',
        jest.fn(() => ({ liteAdaptor: mockLiteAdaptor })),
      ],
      [
        '@mathjax/src/mjs/handlers/html.js',
        jest.fn(() => ({ RegisterHTMLHandler: mockRegisterHTMLHandler })),
      ],
      ['@mathjax/src/mjs/output/svg.js', jest.fn(() => ({ SVG: mockSVG }))],
      ['@mathjax/src/mjs/input/tex.js', jest.fn(() => ({ TeX: mockTeX }))],
    ]

    for (const [module, mock] of mocks) jest.doMock(module, mock)

    jest.doMock('../../src/generated/mathjax-lazy-tex-packages', () => ({
      loadTexPackages: mockLoadTexPackages,
    }))

    try {
      await jest.isolateModulesAsync(async () => {
        const { mathjax } = await import('../../src/internals/mathjax.node')

        for (const [, mock] of mocks) expect(mock).not.toHaveBeenCalled()
        expect(mockLoadTexPackages).not.toHaveBeenCalled()

        // Load the MathJax modules lazily on first use
        expect(mathjax()).toStrictEqual({
          mathjax: mockMathJaxModule,
          packages: ['mock-package'],
          fontExtensions: [],
          adaptor: mockAdaptor,
          handler: mockHandler,
          SVG: mockSVG,
          TeX: mockTeX,
        })

        for (const [, mock] of mocks) expect(mock).toHaveBeenCalledTimes(1)
        expect(mockLiteAdaptor).toHaveBeenCalledTimes(1)
        expect(mockRegisterHTMLHandler).toHaveBeenCalledWith(mockAdaptor)
        expect(mockLoadTexPackages).toHaveBeenCalledTimes(1)

        mathjax()

        for (const [, mock] of mocks) expect(mock).toHaveBeenCalledTimes(1)
        expect(mockLiteAdaptor).toHaveBeenCalledTimes(1)
        expect(mockRegisterHTMLHandler).toHaveBeenCalledTimes(1)
        expect(mockLoadTexPackages).toHaveBeenCalledTimes(1)
      })
    } finally {
      for (const [module] of mocks) jest.dontMock(module)
      jest.dontMock('../../src/generated/mathjax-lazy-tex-packages')
    }
  })
})
