/** @jest-environment jsdom */
import context from '../_helpers/context'
import Marp from '../../src/marp'
import fittingObserver from '../../src/fitting/observer'

describe('Fitting observer', () => {
  const setContentSize = (content: HTMLElement, width, height) =>
    Object.defineProperties(content, {
      scrollWidth: { configurable: true, get: () => width },
      scrollHeight: { configurable: true, get: () => height },
    })

  it('calls window.requestAnimationFrame with myself', () => {
    const spy = jest.spyOn(window, 'requestAnimationFrame')

    try {
      fittingObserver()
      expect(spy).toHaveBeenCalledWith(fittingObserver)
    } finally {
      spy.mockRestore()
    }
  })

  context('when the fitting header is rendered', () => {
    let svg: SVGSVGElement
    let foreignObj: SVGForeignObjectElement
    let content: HTMLSpanElement

    beforeEach(() => {
      document.body.innerHTML = new Marp().render('# <!-- fit --> fitting').html

      svg = document.querySelector('svg[data-marp-fitting="svg"]')
      foreignObj = svg.querySelector('foreignObject')
      content = foreignObj.querySelector('span[data-marp-fitting-svg-content]')

      setContentSize(content, 100, 200)
    })

    it('updates SVG attributes into the content size', () => {
      expect(foreignObj.getAttribute('width')).toBeFalsy()
      expect(foreignObj.getAttribute('height')).toBeFalsy()
      expect(svg.getAttribute('viewBox')).toBeFalsy()

      fittingObserver()
      expect(foreignObj.getAttribute('width')).toBe('100')
      expect(foreignObj.getAttribute('height')).toBe('200')
      expect(svg.getAttribute('viewBox')).toBe('0 0 100 200')
    })

    it('updates viewBox and toggles reflow class when content size was updated', () => {
      fittingObserver()
      expect(svg.classList.contains('__reflow__')).toBe(true)

      fittingObserver()
      expect(svg.classList.contains('__reflow__')).toBe(true) // no change

      setContentSize(content, 200, 300)
      fittingObserver()
      expect(foreignObj.getAttribute('width')).toBe('200')
      expect(foreignObj.getAttribute('height')).toBe('300')
      expect(svg.getAttribute('viewBox')).toBe('0 0 200 300')
      expect(svg.classList.contains('__reflow__')).toBe(false)
    })

    it('keeps minimum svg size 1x1 even if content size is empty', () => {
      setContentSize(content, 0, 0)
      fittingObserver()

      expect(foreignObj.getAttribute('width')).toBe('1')
      expect(foreignObj.getAttribute('height')).toBe('1')
      expect(svg.getAttribute('viewBox')).toBe('0 0 1 1')
    })

    it('can assign preserveAspectRatio attribute by CSS variable', () => {
      // Default value
      fittingObserver()
      expect(svg.getAttribute('preserveAspectRatio')).toBe('xMinYMin meet')

      // CSS variables
      const mock = jest.spyOn(CSSStyleDeclaration.prototype, 'getPropertyValue')

      try {
        mock.mockImplementation(p => p === '--preserve-aspect-ratio' && 'ok')

        fittingObserver()
        expect(svg.getAttribute('preserveAspectRatio')).toBe('ok')
      } finally {
        mock.mockRestore()
      }
    })
  })

  context('when the auto-scalable code block is rendered', () => {
    let svg: SVGSVGElement
    let pre: HTMLPreElement
    let content: HTMLSpanElement

    beforeEach(() => {
      document.body.innerHTML = new Marp().render('```\nauto-scalble\n```').html

      svg = document.querySelector('svg[data-marp-fitting-code]')
      pre = document.querySelector('section pre')
      content = svg.querySelector('span[data-marp-fitting-svg-content]')

      setContentSize(content, 200, 100)
    })

    const setPreWidth = clientWidth =>
      Object.defineProperty(pre, 'clientWidth', {
        configurable: true,
        get: () => clientWidth,
      })

    it("restricts min width to <pre> element's width without padding", () => {
      const computed = jest.spyOn(window, 'getComputedStyle')

      try {
        computed.mockImplementation(() => ({
          paddingLeft: 0,
          paddingRight: 0,
          getPropertyValue: () => undefined,
        }))

        // pre width > svg width
        setPreWidth(300)
        fittingObserver()
        expect(svg.getAttribute('viewBox')).toBe('0 0 300 100')

        // svg width > pre width
        setPreWidth(100)
        fittingObserver()
        expect(svg.getAttribute('viewBox')).toBe('0 0 200 100')

        // Consider padding
        computed.mockImplementation(() => ({
          paddingLeft: '50px',
          paddingRight: '70px',
          getPropertyValue: () => undefined,
        }))

        setPreWidth(300) // 300 - 50 - 70 = 180px
        fittingObserver()
        expect(svg.getAttribute('viewBox')).toBe('0 0 200 100')
      } finally {
        computed.mockRestore()
      }
    })
  })
})
