/** @jest-environment jsdom */
import * as browser from '../../src/custom-elements/browser/index'
import { MarpAutoScaling } from '../../src/custom-elements/browser/marp-auto-scaling'
import { elements } from '../../src/custom-elements/definitions'

beforeAll(() => {
  window.ResizeObserver = jest.fn(function (
    this: ResizeObserver,
    cb: ResizeObserverCallback
  ) {
    this.observe = jest.fn((target) => {
      cb(
        [
          {
            target,
            contentRect: {
              x: 0,
              y: 0,
              width: 100,
              height: 50,
              left: 0,
              top: 0,
              right: 100,
              bottom: 50,
              toJSON: () => ({}),
            },
            // Sizes are not used because Safari doesn't support them
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        this
      )
    })
    this.unobserve = jest.fn()
    this.disconnect = jest.fn()
  }) as any
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
    it("applies the size of contents to SVG's viewbox", () => {
      browser.applyCustomElements()

      document.body.innerHTML = '<marp-auto-scaling>test</marp-auto-scaling>'

      const autoScaling = document.querySelector(
        'marp-auto-scaling'
      ) as MarpAutoScaling
      const svg = autoScaling.shadowRoot.querySelector('svg') as SVGElement

      expect(svg.getAttribute('viewBox')).toBe('0 0 100 50')
    })

    it('sets the correct alignment by text-align style inherited from the parent', () => {
      const getComputedStyle = jest.spyOn<any, any>(window, 'getComputedStyle')
      browser.applyCustomElements()

      const getElementsWithStyle = (
        style:
          | Record<string, string>
          | { getPropertyValue?: (prop: string) => string | undefined }
      ) => {
        getComputedStyle.mockImplementationOnce(() => ({
          getPropertyValue: () => undefined,
          ...style,
        }))

        document.body.innerHTML = '<marp-auto-scaling>test</marp-auto-scaling>'

        const el = document.querySelector(
          'marp-auto-scaling'
        ) as MarpAutoScaling
        const svg = el.shadowRoot?.querySelector('svg') as SVGElement
        const container = svg.querySelector(
          '[data-marp-auto-scaling-container]'
        ) as HTMLElement

        return { el, svg, container }
      }

      // Left-aligned
      const leftAligned = getElementsWithStyle({ textAlign: 'left' })

      expect(leftAligned.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMinYMid meet'
      )
      expect(leftAligned.container.style.marginRight).toBe('auto')
      expect(leftAligned.container.style.marginLeft).toBe('0px')

      // Center-aligned
      const centerAligned = getElementsWithStyle({ textAlign: 'center' })

      expect(centerAligned.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMidYMid meet'
      )
      expect(centerAligned.container.style.marginRight).toBe('auto')
      expect(centerAligned.container.style.marginLeft).toBe('auto')

      // Right-aligned
      const rightAligned = getElementsWithStyle({ textAlign: 'right' })

      expect(rightAligned.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMaxYMid meet'
      )
      expect(rightAligned.container.style.marginRight).toBe('0px')
      expect(rightAligned.container.style.marginLeft).toBe('auto')

      // Logical alignment
      const startAligned = getElementsWithStyle({ textAlign: 'start' })

      expect(startAligned.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMinYMid meet'
      )
      expect(startAligned.container.style.marginRight).toBe('auto')
      expect(startAligned.container.style.marginLeft).toBe('0px')

      const startAlignedRtl = getElementsWithStyle({
        textAlign: 'start',
        direction: 'rtl',
      })

      expect(startAlignedRtl.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMaxYMid meet'
      )
      expect(startAlignedRtl.container.style.marginRight).toBe('0px')
      expect(startAlignedRtl.container.style.marginLeft).toBe('auto')

      const endAligned = getElementsWithStyle({
        textAlign: 'end',
      })

      expect(endAligned.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMaxYMid meet'
      )
      expect(endAligned.container.style.marginRight).toBe('0px')
      expect(endAligned.container.style.marginLeft).toBe('auto')

      const endAlignedRtl = getElementsWithStyle({
        textAlign: 'end',
        direction: 'rtl',
      })

      expect(endAlignedRtl.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMinYMid meet'
      )
      expect(endAlignedRtl.container.style.marginRight).toBe('auto')
      expect(endAlignedRtl.container.style.marginLeft).toBe('0px')

      // Overloading preserveAspectRatio by CSS custom property
      const overloaded = getElementsWithStyle({
        textAlign: 'left',
        getPropertyValue: (prop: string) => {
          if (prop === '--preserve-aspect-ratio') return 'xMaxYMid meet'
          return undefined
        },
      })

      expect(overloaded.svg.getAttribute('preserveAspectRatio')).toBe(
        'xMaxYMid meet'
      )
      expect(overloaded.container.style.marginRight).toBe('0px')
      expect(overloaded.container.style.marginLeft).toBe('auto')
    })

    describe('Rendering workaround for Chromium 105+', () => {
      const waitNextRendering = () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      it("flushes SVG's display style on mounted", async () => {
        expect.hasAssertions()

        browser.applyCustomElements()
        document.body.innerHTML = '<marp-auto-scaling>test</marp-auto-scaling>'

        const autoScaling = document.querySelector(
          'marp-auto-scaling'
        ) as MarpAutoScaling
        const svg = autoScaling.shadowRoot.querySelector('svg') as SVGElement

        // Initially SVG's display style is not set
        expect(svg.style.display).toBe('')

        // At the next rendering frame, display style is set as `inline`
        await waitNextRendering()
        expect(svg.style.display).toBe('inline')

        // After that, display style is reverted to empty string
        await waitNextRendering()
        expect(svg.style.display).toBe('')
      })
    })
  })
})
