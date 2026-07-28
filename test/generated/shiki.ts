import fs from 'node:fs'
import path from 'node:path'
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
    // Jest cannot parse nodeRequire directly, so we check the generated source code instead
    const lazyLoaderSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/generated/shiki-lang-lazy-loaders.ts'),
      'utf8',
    )
    const lazyLangs = [
      ...lazyLoaderSource.matchAll(
        /^\s*"([^"]+)": \(\) => nodeRequire\("shiki\/langs\/[^"]+"\)/gm,
      ),
    ].map((match) => match[1])

    expect(lazyLangs).toEqual(expect.arrayContaining(expectedLangs))
    expect(lazyLangs).toHaveLength(expectedLangs.length)
  })

  it('defines each loader as a function', () => {
    expect(Object.values(langLoaders)).toEqual(
      expect.arrayOf(expect.any(Function)),
    )
  })
})
