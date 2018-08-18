import browser from '../src/browser'
import fittingObserver from '../src/fitting/observer'

jest.mock('../src/fitting/observer')

describe('Browser observers', () => {
  it('calls observers', () => {
    browser()
    expect(fittingObserver).toHaveBeenCalled()
  })
})
