import { Marpit } from '@marp-team/marpit'
import type { Options } from '@marp-team/marpit'
import { load } from 'cheerio'
import MarkdownIt from 'markdown-it'
import { codeBlockPlugin } from '../../src/auto-scaling/code-block'

jest.mock('../../src/auto-scaling/utils', () => ({
  // Always enable auto-scaling for testing
  isEnabledAutoScaling: jest.fn().mockReturnValue(true),
}))

describe('Auto scaling code block plugin', () => {
  const instance = (opts: Options = {}) =>
    new Marpit({ inlineSVG: true, ...opts }).use(codeBlockPlugin)

  it('renders auto-scaling tag for indented code block', () => {
    const { html } = instance().render('    CODE BLOCK')
    const pre = load(html)('pre')

    expect(pre).toHaveLength(1)
    expect(pre.attr('is')).toBe('marp-pre')
    expect(pre.attr('data-auto-scaling')).toBe('downscale-only')
    expect(pre.text()).toContain('CODE BLOCK')
  })

  it('renders auto-scaling tag for fenced code block', () => {
    const { html } = instance().render('```ts\nconst foo = "bar"\n```')
    const pre = load(html)('pre')

    expect(pre).toHaveLength(1)
    expect(pre.attr('is')).toBe('marp-pre')
    expect(pre.attr('data-auto-scaling')).toBe('downscale-only')
    expect(pre.text()).toContain('const foo = "bar"')
  })

  it("does not render auto-scaling tag when Marpit's inline SVG mode is disabled", () => {
    const { html } = instance({ inlineSVG: false }).render('    CODE BLOCK')
    const pre = load(html)('pre')

    expect(pre).toHaveLength(1)
    expect(pre.attr('is')).toBeUndefined()
    expect(pre.attr('data-auto-scaling')).toBeUndefined()
  })

  it('renders auto-scaling tag with custom code block renderer', () => {
    const marpit = instance({
      markdown: new MarkdownIt().use((md) => {
        const defaultCodeBlock = md.renderer.rules.code_block!

        md.renderer.rules.code_block = function (tokens, idx, opts, env, self) {
          const html = defaultCodeBlock.call(this, tokens, idx, opts, env, self)
          return html.replace('<pre', '<pre data-custom-renderer').trim()
        }
      }),
    })

    const { html } = marpit.render('    CODE BLOCK')
    const pre = load(html)('pre')

    expect(pre.attr('data-custom-renderer')).toBe('')
    expect(pre.attr('is')).toBe('marp-pre')
    expect(pre.attr('data-auto-scaling')).toBe('downscale-only')
  })
})
