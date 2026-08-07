/* eslint-disable import-x/no-duplicates */
import * as marpShikiBase from '../../src/internals/shiki'
import * as marpShikiNode from '../../src/internals/shiki.node'
import * as marpShiki from '#marp-shiki'

describe('#marp-shiki', () => {
  it('exports src/internals/shiki', () => {
    expect(marpShiki).toStrictEqual(marpShikiBase)
    expect(marpShiki.shiki.highlighter).toBe(marpShikiBase.shiki.highlighter)
  })
})

describe('#marp-shiki for Node.js', () => {
  it('has same interface with #marp-shiki', () => {
    expect(Object.keys(marpShikiNode)).toStrictEqual(Object.keys(marpShiki))
  })

  it('requires Shiki lazily only when used', async () => {
    const mockEngine = {}
    const mockTheme = {}
    const mockHighlighter = {}
    const mockLangLoader = jest.fn()
    const mockCreateJavaScriptRegexEngine = jest.fn(() => mockEngine)
    const mockCreateCssVariablesTheme = jest.fn(() => mockTheme)
    const mockCreateHighlighterCoreSync = jest.fn(() => mockHighlighter)
    const mockShikiCore = jest.fn(() => ({
      createCssVariablesTheme: mockCreateCssVariablesTheme,
      createHighlighterCoreSync: mockCreateHighlighterCoreSync,
    }))
    const mockShikiJavaScriptEngine = jest.fn(() => ({
      createJavaScriptRegexEngine: mockCreateJavaScriptRegexEngine,
    }))

    jest.doMock('shiki/core', mockShikiCore)
    jest.doMock('shiki/engine/javascript', mockShikiJavaScriptEngine)
    jest.doMock('../../src/generated/shiki-lang-lazy-loaders', () => ({
      langLoaders: { mock: mockLangLoader },
    }))

    try {
      await jest.isolateModulesAsync(async () => {
        const { shiki } = await import('../../src/internals/shiki.node')
        expect(mockShikiCore).not.toHaveBeenCalled()
        expect(mockShikiJavaScriptEngine).not.toHaveBeenCalled()

        expect(shiki.resolveLang('mock')).toBe(mockLangLoader)
        expect(mockShikiCore).not.toHaveBeenCalled()
        expect(mockShikiJavaScriptEngine).not.toHaveBeenCalled()

        // Load the Shiki modules lazily on first use
        expect(shiki.highlighter).toBe(mockHighlighter)
        expect(mockShikiCore).toHaveBeenCalledTimes(1)
        expect(mockShikiJavaScriptEngine).toHaveBeenCalledTimes(1)
        expect(mockCreateJavaScriptRegexEngine).toHaveBeenCalled()
        expect(mockCreateCssVariablesTheme).toHaveBeenCalled()
        expect(mockCreateHighlighterCoreSync).toHaveBeenCalled()

        expect(shiki.highlighter).toBe(mockHighlighter)
        expect(mockShikiCore).toHaveBeenCalledTimes(1)
        expect(mockShikiJavaScriptEngine).toHaveBeenCalledTimes(1)
        expect(mockCreateHighlighterCoreSync).toHaveBeenCalledTimes(1)
      })
    } finally {
      jest.dontMock('shiki/core')
      jest.dontMock('shiki/engine/javascript')
      jest.dontMock('../../src/generated/shiki-lang-lazy-loaders')
    }
  })
})
