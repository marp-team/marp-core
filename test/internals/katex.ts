/* eslint-disable import-x/no-duplicates */
import * as marpKatexBase from '../../src/internals/katex'
import * as marpKatexNode from '../../src/internals/katex.node'
import * as marpKatex from '#marp-katex'

describe('#marp-katex', () => {
  it('exports src/internals/katex', () => {
    expect(marpKatex).toStrictEqual(marpKatexBase)
    expect(marpKatex.katex).toBe(marpKatexBase.katex)
  })
})

describe('#marp-katex for Node.js', () => {
  it('has same interface with #marp-katex', () => {
    expect(Object.keys(marpKatexNode)).toStrictEqual(Object.keys(marpKatex))
  })

  it('requires KaTeX lazily only when used', async () => {
    const mockRenderToString = jest.fn(() => '<span>katex</span>')
    const mockKaTeX = jest.fn(() => ({
      renderToString: mockRenderToString,
      version: 'mocked.version',
    }))

    jest.doMock('katex', mockKaTeX)

    try {
      await jest.isolateModulesAsync(async () => {
        const { katex } = await import('../../src/internals/katex.node')
        expect(mockKaTeX).not.toHaveBeenCalled()

        // Load the KaTeX module lazily on first access
        expect(katex.version).toBe('mocked.version')
        expect(mockKaTeX).toHaveBeenCalledTimes(1)

        expect(katex.renderToString('xxx')).toBe('<span>katex</span>')
        expect(mockRenderToString).toHaveBeenCalledWith('xxx')
        expect(mockKaTeX).toHaveBeenCalledTimes(1) // Use cached KaTeX module
      })
    } finally {
      jest.dontMock('katex')
    }
  })
})
