import { source } from '@mathjax/src/components/mjs/source.js'
import {
  packages,
  registerMathJaxTexPackages,
} from '../../src/generated/mathjax-tex-packages'

describe('Generated MathJax TeX packages', () => {
  it('lists every directly linkable TeX package', () => {
    const expectedPackages = [
      'base',
      ...Object.keys(source)
        .filter((name) => name.startsWith('[tex]/'))
        .map((name) => name.slice(6))
        .filter((name) => name !== 'autoload' && name !== 'require')
        .sort(),
    ]

    expect(packages).toEqual(expectedPackages)
  })

  it('loads the font extensions required by TeX packages', () => {
    const fontExtensions = registerMathJaxTexPackages()

    expect(fontExtensions.map(({ name }) => name)).toEqual([
      // https://docs.mathjax.org/en/v4.0/upgrading/whats-new-4.0/fonts.html
      'mathjax-bbm',
      'mathjax-bboldx',
      'mathjax-dsfont',
      'mathjax-mhchem',
    ])
  })
})
