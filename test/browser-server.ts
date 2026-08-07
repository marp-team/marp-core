import { browser } from '../src/browser'

// Test for `@marp-team/marp-core/browser` for server-side JS environment
describe('Browser script (Server-side)', () => {
  it('is available even in server-side environment', () => {
    expect(browser).toBeDefined()
  })

  it('throws an error if called', () => {
    expect(() => browser()).toThrow(
      "Marp Core's browser script is valid only in browser context.",
    )
  })
})
