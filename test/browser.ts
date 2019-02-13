/** @jest-environment jsdom */
import browser from '../src/browser'
import context from './_helpers/context'
import fittingObserver from '../src/fitting/observer'

const polyfill = jest.fn()

jest.mock('@marp-team/marpit-svg-polyfill', () => ({
  polyfills: () => [polyfill],
}))

jest.mock('../src/fitting/observer')

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

describe('Browser observers', () => {
  it('executes observers for polyfill and fitting', () => {
    const spy = jest.spyOn(window, 'requestAnimationFrame')

    browser()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(polyfill).toHaveBeenCalledTimes(1)
    expect(fittingObserver).toHaveBeenCalledTimes(1)

    spy.mock.calls[0][0](performance.now())
    expect(spy).toHaveBeenCalledTimes(2)
    expect(polyfill).toHaveBeenCalledTimes(2)
    expect(fittingObserver).toHaveBeenCalledTimes(2)
  })

  context('with observe argument is false', () => {
    it('does not call window.requestAnimationFrame', () => {
      const spy = jest.spyOn(window, 'requestAnimationFrame')

      browser(false)
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
