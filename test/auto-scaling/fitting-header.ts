import { Marpit } from '@marp-team/marpit'
import type { Options } from '@marp-team/marpit'
import MarkdownIt from 'markdown-it'
import { fittingHeaderPlugin } from '../../src/auto-scaling/fitting-header'

jest.mock('../../src/auto-scaling/utils', () => ({
  // Always enable auto-scaling for testing
  isEnabledAutoScaling: jest.fn().mockReturnValue(true),
}))

describe('Auto scaling fitting header plugin', () => {
  const instance = (opts: Options = {}) =>
    new Marpit({ inlineSVG: true, ...opts }).use(fittingHeaderPlugin)

  it('does not render auto-scaling tag when the header is not annotated', () => {
    const { html } = instance().render('# heading')

    expect(html).toContain('<h1>')
    expect(html).not.toContain('data-auto-scaling')
  })

  it('renders auto-scaling tag when the header is annotated', () => {
    const { html, comments } = instance().render('# heading <!--fit-->')

    expect(html).toContain('<h1 is="marp-h1" data-auto-scaling>')
    expect(comments[0]).toHaveLength(0) // Annotation comment should be removed from the output
  })

  it('does not render auto-scaling tag when the annotated token is not a heading', () => {
    const { html } = instance().render('text <!--fit-->')

    expect(html).not.toContain('data-auto-scaling')
  })

  it("does not render auto-scaling tag when Marpit's inline SVG mode is disabled", () => {
    const { html, comments } = instance({ inlineSVG: false }).render(
      '# heading <!--fit-->',
    )

    expect(html).toContain('<h1>')
    expect(html).not.toContain('data-auto-scaling')
    expect(comments[0]).toStrictEqual(['fit']) // Annotation comment should be preserved in the output
  })

  it('renders auto-scaling tag with custom renderer', () => {
    const marpit = instance({
      markdown: new MarkdownIt().use((md) => {
        md.renderer.rules.heading_open = (tokens, idx, opts, _env, self) =>
          `<div data-custom-renderer>${self.renderToken(tokens, idx, opts).trim()}`

        md.renderer.rules.heading_close = (tokens, idx, opts, _env, self) =>
          `${self.renderToken(tokens, idx, opts).trim()}</div>`
      }),
    })
    const { html } = marpit.render('# heading <!--fit-->')

    expect(html).toContain(
      '<div data-custom-renderer><h1 is="marp-h1" data-auto-scaling>',
    )
    expect(html).toContain('</h1></div>')
  })
})
