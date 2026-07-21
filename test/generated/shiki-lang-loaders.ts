import { bundledLanguagesBase } from 'shiki/langs'
import { langLoaders } from '../../src/generated/shiki-lang-loaders'

describe('Generated Shiki loaders', () => {
  it('defines static loaders for every bundled Shiki language', () => {
    const langKeys = Object.keys(langLoaders)
    const expectedLangs = Object.keys(bundledLanguagesBase)

    expect(langKeys).toEqual(expect.arrayContaining(expectedLangs))
    expect(langKeys).toHaveLength(expectedLangs.length)
  })

  it('defines each loader as a function', () => {
    expect(Object.values(langLoaders)).toEqual(
      expect.arrayOf(expect.any(Function)),
    )
  })
})
