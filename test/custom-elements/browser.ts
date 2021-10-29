/** @jest-environment jsdom */
// Avoid to conflict polyfill with types for built-in ResizeObserver
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver'
import * as browser from '../../src/custom-elements/browser/index'
import { elements } from '../../src/custom-elements/definitions'

beforeAll(() => {
  window.ResizeObserver = ResizeObserver
})

afterEach(() => {
  jest.restoreAllMocks()
  window[browser.marpCustomElementsRegisteredSymbol] = false

  // Reset custom elements defined in JSDOM
  const [implSymbol] = Object.getOwnPropertySymbols(customElements)
  const impl: any = customElements[implSymbol]
  impl._customElementDefinitions = []
  impl._whenDefinedPromiseMap = Object.create(null)
})

describe('The hydration script for custom elements', () => {
  describe('#applyCustomElements', () => {
    it('defines custom elements', () => {
      const elms = [
        ...Object.keys(elements).map((el) => `marp-${el}`),
        'marp-auto-scaling',
      ]

      for (const el of elms) {
        expect(customElements.get(el)).toBeUndefined()
      }

      browser.applyCustomElements()

      for (const el of elms) {
        const customElm = customElements.get(el) as CustomElementConstructor

        expect(customElm).toBeTruthy()
        expect(new customElm() instanceof HTMLElement).toBe(true)
      }

      // If applied twice, it should not define new elements
      browser.applyCustomElements()
    })

    it('replaces <pre is="marp-pre"> to <marp-pre>', () => {
      document.body.innerHTML =
        '<pre is="marp-pre">1</pre><pre class="two" is="marp-pre">2</pre>'

      browser.applyCustomElements()

      expect(document.body.innerHTML).toMatchInlineSnapshot(
        `"<marp-pre is=\\"marp-pre\\">1</marp-pre><marp-pre class=\\"two\\" is=\\"marp-pre\\">2</marp-pre>"`
      )
    })

    it('does not replace <h1 is="marp-h1"> to <marp-h1>', () => {
      const html = '<h1 is="marp-h1">test</h1>'
      document.body.innerHTML = html

      browser.applyCustomElements()
      expect(document.body.innerHTML).toBe(html)
    })

    describe('when the browser is not supported "is" attribute for customized built-in elements', () => {
      beforeEach(() => {
        jest
          .spyOn(browser, 'isSupportedCustomizedBuiltInElements')
          .mockReturnValue(false)
      })

      it('replaces all of elements that are using "is" attribute to the standalone custom element', () => {
        document.body.innerHTML = Object.keys(elements)
          .map((elm) => `<${elm} is="marp-${elm}"></${elm}>`)
          .join('\n')

        browser.applyCustomElements()
        expect(document.body.innerHTML).toMatchInlineSnapshot(`
          "<marp-h1 is=\\"marp-h1\\" role=\\"heading\\" aria-level=\\"1\\"></marp-h1>
          <marp-h2 is=\\"marp-h2\\" role=\\"heading\\" aria-level=\\"2\\"></marp-h2>
          <marp-h3 is=\\"marp-h3\\" role=\\"heading\\" aria-level=\\"3\\"></marp-h3>
          <marp-h4 is=\\"marp-h4\\" role=\\"heading\\" aria-level=\\"4\\"></marp-h4>
          <marp-h5 is=\\"marp-h5\\" role=\\"heading\\" aria-level=\\"5\\"></marp-h5>
          <marp-h6 is=\\"marp-h6\\" role=\\"heading\\" aria-level=\\"6\\"></marp-h6>
          <marp-span is=\\"marp-span\\"></marp-span>
          <marp-pre is=\\"marp-pre\\"></marp-pre>"
        `)
      })
    })
  })

  describe('Customized built-in elements', () => {
    it('uses <marp-auto-scaling> custom element if set data-auto-scaling attr', () => {
      document.body.innerHTML = '<h1 is="marp-h1" data-auto-scaling>test</h1>'
      browser.applyCustomElements()

      const h1 = document.body.firstElementChild as HTMLElement
      expect(h1.shadowRoot?.querySelector('marp-auto-scaling')).toBeTruthy()

      // Track the change of attribute
      h1.removeAttribute('data-auto-scaling')
      expect(h1.shadowRoot?.querySelector('marp-auto-scaling')).toBeFalsy()

      h1.setAttribute('data-auto-scaling', 'downscale-only')
      expect(
        h1.shadowRoot?.querySelector('marp-auto-scaling[data-downscale-only]')
      ).toBeTruthy()
    })
  })

  describe('<marp-auto-scaling>', () => {
    // TODO: Test behavior of <marp-auto-scaling>
  })
})
