import { Marpit } from '@marp-team/marpit'
import type { Options as MarpitOptions } from '@marp-team/marpit'
import { load } from 'cheerio'
import MarkdownIt from 'markdown-it'
import { markdown as emojiPlugin } from '../../src/emoji/emoji'
import type { MarpOptions } from '../../src/marp'

describe('Emoji plugin', () => {
  const instance = (opts: MarpOptions = {}) =>
    new Marpit(opts as MarpitOptions).use(emojiPlugin)

  it('converts shortcode to unicode emoji', () => {
    const marpit = instance({ emoji: { shortcode: true } })
    const { html } = marpit.render('# :heart:')
    const $ = load(html)

    expect($('h1').text()).toBe('\u2764\ufe0f')
  })

  it('converts unicode emoji in code elements to twemoji image', () => {
    const marpit = instance({ emoji: { unicode: 'twemoji' } })

    const $inline = load(marpit.render('`👍`').html)
    expect($inline('code img[data-marp-twemoji][alt="👍"]')).toHaveLength(1)

    const $block = load(marpit.render('    👍').html)
    expect($block('pre code img[data-marp-twemoji][alt="👍"]')).toHaveLength(1)

    const $fence = load(marpit.render('```text\n👍\n```').html)
    expect($fence('pre code img[data-marp-twemoji][alt="👍"]')).toHaveLength(1)
  })

  it('keeps custom code renderers while converting unicode emoji to twemoji image', () => {
    const marpit = instance({
      emoji: { unicode: 'twemoji' },
      markdown: new MarkdownIt().use((md) => {
        const { code_inline, code_block, fence } = md.renderer.rules

        md.renderer.rules.code_inline = (...rest) =>
          `<span data-custom-inline>${code_inline?.(...rest).trim()}</span>`

        md.renderer.rules.code_block = (...rest) =>
          `<div data-custom-block>${code_block?.(...rest).trim()}</div>`

        md.renderer.rules.fence = (...rest) =>
          `<div data-custom-fence>${fence?.(...rest).trim()}</div>`
      }),
    })

    const $inline = load(marpit.render('`👍`').html)
    expect(
      $inline('span[data-custom-inline] code img[data-marp-twemoji][alt="👍"]'),
    ).toHaveLength(1)

    const $block = load(marpit.render('    👍').html)
    expect(
      $block(
        'div[data-custom-block] pre code img[data-marp-twemoji][alt="👍"]',
      ),
    ).toHaveLength(1)

    const $fence = load(marpit.render('```text\n👍\n```').html)
    expect(
      $fence(
        'div[data-custom-fence] pre code.language-text img[data-marp-twemoji][alt="👍"]',
      ),
    ).toHaveLength(1)
  })
})
