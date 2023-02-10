/** @jest-environment jsdom */
import { observe } from '@marp-team/marpit-svg-polyfill'
import { browser, observer } from '../src/browser'
import { applyCustomElements } from '../src/custom-elements/browser'

const polyfillCleanup = jest.fn()

jest.mock('@marp-team/marpit-svg-polyfill', () => ({
  observe: jest.fn(() => polyfillCleanup),
}))

jest.mock('../src/custom-elements/browser')

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

describe('Browser script', () => {
  it('executes polyfill observer and set-up for custom elements', () => {
    const browserInterface = browser()

    expect(observe).toHaveBeenCalledTimes(1)
    expect(applyCustomElements).toHaveBeenCalledTimes(1)

    expect(browser()).toStrictEqual(browserInterface)
    expect(browserInterface).toStrictEqual(expect.any(Function))
    expect(browserInterface).toStrictEqual(browserInterface.cleanup)

    polyfillCleanup.mockClear()
    browserInterface.cleanup()
    expect(polyfillCleanup).toHaveBeenCalled()
  })

  describe('with passed shadow root', () => {
    it('calls polyfill observer and custom elements set-up with specific target', () => {
      const root = document.createElement('div').attachShadow({ mode: 'open' })
      const browserInterface = browser(root)

      expect(observe).toHaveBeenCalledWith(root)
      expect(applyCustomElements).toHaveBeenCalledWith(root)
      browserInterface.cleanup()
    })
  })

  describe('#update', () => {
    it('calls itself again to update custom element DOMs', () => {
      const browserInterface = browser()

      expect(applyCustomElements).toHaveBeenCalledTimes(1)
      expect(browserInterface.update()).toStrictEqual(browserInterface)
      expect(applyCustomElements).toHaveBeenCalledTimes(2)
      browserInterface.cleanup()

      // For shadow root
      const root = document.createElement('div').attachShadow({ mode: 'open' })
      const interfaceShadowRoot = browser(root)

      expect(applyCustomElements).toHaveBeenNthCalledWith(3, root)
      expect(interfaceShadowRoot.update()).toStrictEqual(interfaceShadowRoot)
      expect(applyCustomElements).toHaveBeenNthCalledWith(4, root)
      interfaceShadowRoot.cleanup()
    })
  })
})

describe('Observer', () => {
  describe('with once option', () => {
    it('does not call window.requestAnimationFrame', () => {
      const spy = jest.spyOn(window, 'requestAnimationFrame')
      const cleanup = observer({ once: true })

      expect(spy).not.toHaveBeenCalled()
      cleanup()
    })
  })
})
