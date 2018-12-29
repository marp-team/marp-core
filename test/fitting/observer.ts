/** @jest-environment jsdom */
import context from '../_helpers/context'
import Marp from '../../src/marp'
import fittingObserver from '../../src/fitting/observer'

afterEach(() => jest.restoreAllMocks())

describe('Fitting observer', () => {
  const setContentSize = (content: HTMLElement, width, height) =>
    Object.defineProperties(content, {
      scrollWidth: { configurable: true, get: () => width },
      scrollHeight: { configurable: true, get: () => height },
    })

  context('when the fitting header is rendered', () => {
    let svg: SVGSVGElement
    let foreignObj: SVGForeignObjectElement
    let content: HTMLSpanElement

    beforeEach(() => {
      document.body.innerHTML = new Marp().render('# <!-- fit --> fitting').html

      svg = document.querySelector<SVGSVGElement>(
        'svg[data-marp-fitting="svg"]'
      )!
      foreignObj = svg.querySelector('foreignObject')!
      content = foreignObj.querySelector<HTMLSpanElement>(
        'span[data-marp-fitting-svg-content]'
      )!

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
      const mock = jest
        .spyOn(CSSStyleDeclaration.prototype, 'getPropertyValue')
        .mockImplementation(p => p === '--preserve-aspect-ratio' && 'ok')

      fittingObserver()
      expect(svg.getAttribute('preserveAspectRatio')).toBe('ok')
    })
  })

  context('when the auto-scalable elements is rendered', () => {
    let codeSvg: SVGSVGElement
    let codePre: HTMLPreElement
    let codeContent: HTMLSpanElement
    let mathSvg: SVGSVGElement
    let mathP: HTMLParagraphElement
    let mathContent: HTMLSpanElement

    beforeEach(() => {
      document.body.innerHTML = new Marp().render(
        '```\nauto-scalble\n```\n\n$$ auto-scalable $$'
      ).html

      codeSvg = document.querySelector<SVGSVGElement>(
        'svg[data-marp-fitting-code]'
      )!
      codePre = document.querySelector<HTMLPreElement>('section pre')!
      codeContent = codeSvg.querySelector<HTMLSpanElement>(
        'span[data-marp-fitting-svg-content]'
      )!
      mathSvg = document.querySelector<SVGSVGElement>(
        'svg[data-marp-fitting-math]'
      )!
      mathP = <HTMLParagraphElement>mathSvg.parentElement
      mathContent = <HTMLSpanElement>(
        mathSvg.querySelector('span[data-marp-fitting-svg-content]')!
      )

      setContentSize(codeContent, 200, 100)
      setContentSize(mathContent, 50, 100)
    })

    const setClientWidth = (target, clientWidth) =>
      Object.defineProperty(target, 'clientWidth', {
        configurable: true,
        get: () => clientWidth,
      })

    it("restricts min width to <pre> element's width without padding", () => {
      const computed = jest.spyOn(window, 'getComputedStyle')

      computed.mockImplementation(() => ({
        paddingLeft: 0,
        paddingRight: 0,
        getPropertyValue: () => undefined,
      }))

      setClientWidth(codePre, 300) // pre width > code svg width
      setClientWidth(mathP, 400) // p width > math svg width
      fittingObserver()
      expect(codeSvg.getAttribute('viewBox')).toBe('0 0 300 100')
      expect(mathSvg.getAttribute('viewBox')).toBe('0 0 400 100')

      setClientWidth(codePre, 100) // pre width < code svg width
      setClientWidth(mathP, 25) // o width < math svg width
      fittingObserver()
      expect(codeSvg.getAttribute('viewBox')).toBe('0 0 200 100')
      expect(mathSvg.getAttribute('viewBox')).toBe('0 0 50 100')

      // Consider padding
      computed.mockImplementation(() => ({
        paddingLeft: '50px',
        paddingRight: '70px',
        getPropertyValue: () => undefined,
      }))

      setClientWidth(codePre, 300) // 300 - 50 - 70 = 180px
      setClientWidth(mathP, 180) // 180 - 50 - 70 = 60px
      fittingObserver()
      expect(codeSvg.getAttribute('viewBox')).toBe('0 0 200 100')
      expect(mathSvg.getAttribute('viewBox')).toBe('0 0 60 100')
    })
  })
})
