/** @jest-environment jsdom */
import { browser, observer } from '../src/browser'
import { applyCustomElements } from '../src/custom-elements/browser'

const polyfill = jest.fn()

jest.mock('@marp-team/marpit-svg-polyfill', () => ({
  polyfills: () => [polyfill],
}))

jest.mock('../src/custom-elements/browser')

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

describe('Browser script', () => {
  it('executes observers for polyfill and fitting', () => {
    const spy = jest.spyOn(window, 'requestAnimationFrame')

    const cleanup = browser()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(polyfill).toHaveBeenCalledTimes(1)
    expect(applyCustomElements).toHaveBeenCalledTimes(1)
    expect(browser()).toStrictEqual(cleanup)

    const rafFunc = spy.mock.calls[0][0]
    rafFunc(performance.now())

    expect(spy).toHaveBeenCalledTimes(2)
    expect(polyfill).toHaveBeenCalledTimes(2)

    cleanup()
    rafFunc(performance.now())
    expect(spy).toHaveBeenCalledTimes(2) // No more calling function after cleanup
  })

  describe('with passed shadow root', () => {
    it('calls polyfills and fitting observer with specific target', () => {
      const root = document.createElement('div').attachShadow({ mode: 'open' })
      const cleanup = browser(root)

      expect(polyfill).toHaveBeenCalledWith({ target: root })
      expect(applyCustomElements).toHaveBeenCalledWith(root)
      cleanup()
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
