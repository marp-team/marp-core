import { source } from '@mathjax/src/components/mjs/source.js'
import * as lazyTexPackages from '../../src/generated/mathjax-lazy-tex-packages'
import * as texPackages from '../../src/generated/mathjax-tex-packages'

describe('Generated MathJax TeX packages', () => {
  const expectedPackages = [
    'base',
    ...Object.keys(source)
      .filter((name) => name.startsWith('[tex]/'))
      .map((name) => name.slice(6))
      .filter((name) => name !== 'autoload' && name !== 'require')
      .sort(),
  ]

  it('lists every directly linkable TeX package', () => {
    expect(texPackages.packages).toEqual(expectedPackages)
  })

  it('loads the font extensions required by TeX packages', () => {
    const fontExtensions = texPackages.loadFontExtensions()

    expect(fontExtensions.map(({ name }) => name)).toEqual([
      // https://docs.mathjax.org/en/v4.0/upgrading/whats-new-4.0/fonts.html
      'mathjax-bbm',
      'mathjax-bboldx',
      'mathjax-dsfont',
      'mathjax-mhchem',
    ])
  })

  it('defines lazy requires for every directly linkable TeX package', () => {
    expect(lazyTexPackages.packages).toEqual(expectedPackages)
    expect(
      lazyTexPackages.loadFontExtensions().map(({ name }) => name),
    ).toEqual([
      'mathjax-bbm',
      'mathjax-bboldx',
      'mathjax-dsfont',
      'mathjax-mhchem',
    ])
  })
})
