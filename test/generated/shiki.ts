import { langLoaders as lazyLangLoaders } from '../../src/generated/shiki-lang-lazy-loaders'
import { langLoaders } from '../../src/generated/shiki-lang-loaders'
import { languageIds } from '../../src/generated/shiki-language-ids'

describe('Generated Shiki loaders', () => {
  const expectedLangs = [...new Set(Object.values(languageIds))].sort()

  it('defines static loaders for every bundled Shiki language', () => {
    const loaderKeys = Object.keys(langLoaders)

    expect(loaderKeys).toEqual(expect.arrayContaining(expectedLangs))
    expect(loaderKeys).toHaveLength(expectedLangs.length)
  })

  it('defines lazy loaders for every bundled Shiki language', () => {
    const lazyLoaderKeys = Object.keys(lazyLangLoaders)

    expect(lazyLoaderKeys).toEqual(expect.arrayContaining(expectedLangs))
    expect(lazyLoaderKeys).toHaveLength(expectedLangs.length)
  })

  it('defines each loader as a function', () => {
    expect([
      ...Object.values(langLoaders),
      ...Object.values(lazyLangLoaders),
    ]).toEqual(expect.arrayOf(expect.any(Function)))
  })
})
