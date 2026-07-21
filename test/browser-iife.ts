/** @jest-environment jsdom */
/* eslint-disable @typescript-eslint/no-require-imports */

jest.mock('../src/browser', () => ({ browser: jest.fn() }))

describe('Browser script (iife)', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('falls back to document when currentScript is not available', () => {
    jest.spyOn(document, 'currentScript', 'get').mockReturnValue(null)
    require('../src/browser-iife')

    const { browser } = require('../src/browser')
    expect(browser).toHaveBeenCalledWith(document)
  })

  it('passes the root node of currentScript to browser()', () => {
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const script = document.createElement('script')

    shadowRoot.appendChild(script)

    jest.spyOn(document, 'currentScript', 'get').mockReturnValue(script)
    require('../src/browser-iife')

    const { browser } = require('../src/browser')
    expect(browser).toHaveBeenCalledWith(shadowRoot)
  })
})
