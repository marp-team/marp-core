import { Marpit } from '@marp-team/marpit'
import MarkdownIt from 'markdown-it'
import { marpPlugin } from '../src/plugin'

describe('Plugin helper', () => {
  it('passes through for Marpit compatible instance', () => {
    const marpit = new Marpit()
    const fn = jest.fn()
    const plugin = marpPlugin(fn)

    marpit.use(plugin)
    expect(fn).toHaveBeenCalled()

    const calledThis = fn.mock.contexts[0]
    expect(calledThis).toBe(fn)
  })

  it('throws for incompatible markdown-it instance', () => {
    const md = new MarkdownIt()
    const fn = jest.fn()
    const plugin = marpPlugin(fn)

    expect(() => md.use(plugin)).toThrow(
      'Marp plugin has detected incompatible markdown-it instance.',
    )
  })
})
