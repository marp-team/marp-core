import { Marpit } from '@marp-team/marpit'
import cheerio from 'cheerio'
import postcss from 'postcss'
import context from './_helpers/context'
import { EmojiOptions } from '../src/emoji/emoji'
import { Marp, MarpOptions } from '../src/marp'
import browser from '../src/browser'

jest.mock('../src/browser')
jest.mock('../src/math/katex.scss')

describe('Marp', () => {
  const marp = (opts?: MarpOptions): Marp => new Marp(opts)

  it('extends Marpit', () => expect(marp()).toBeInstanceOf(Marpit))

  describe('markdown option', () => {
    it('renders breaks as <br> element', () => {
      const $ = cheerio.load(marp().markdown.render('hard\nbreak'))
      expect($('br')).toHaveLength(1)
    })

    it('has enabled table syntax', () => {
      const $ = cheerio.load(marp().markdown.render('|a|b|\n|-|-|\n|c|d|'))
      expect($('table > thead > tr > th')).toHaveLength(2)
      expect($('table > tbody > tr > td')).toHaveLength(2)
    })

    it('converts URL to hyperlink', () => {
      const address = 'https://www.google.com/'
      const $ = cheerio.load(marp().markdown.render(address))
      expect($(`a[href="${address}"]`).text()).toBe(address)
    })
  })

  describe('emoji option', () => {
    describe('shortcode option', () => {
      it('converts emoji shorthand to twemoji image by default', () => {
        const { html, css } = marp().render('# :heart:')
        const $ = cheerio.load(html)

        expect($('h1 > img[data-marp-twemoji][alt="❤️"]')).toHaveLength(1)
        expect(css).toContain('img[data-marp-twemoji]')
      })

      context('with true', () => {
        const emoji: EmojiOptions = { shortcode: true }

        it('converts emoji shorthand to unicode emoji', () => {
          const $ = cheerio.load(marp({ emoji }).render('# :heart:').html)
          expect($('h1').html()).toBe('&#x2764;&#xFE0F;')
        })
      })

      context('with false', () => {
        const emoji: EmojiOptions = { shortcode: false }

        it('does not convert emoji shorthand', () => {
          const $ = cheerio.load(marp({ emoji }).render('# :heart:').html)
          expect($('h1').html()).toBe(':heart:')
        })
      })
    })

    describe('unicode option', () => {
      context('with twemoji (by default)', () => {
        const instance = marp()

        it('converts unicode emoji to twemoji image', () => {
          const { html, css } = instance.render('# 👍')
          const $ = cheerio.load(html)

          expect($('h1 > img[data-marp-twemoji][alt="👍"]')).toHaveLength(1)
          expect(css).toContain('img[data-marp-twemoji]')

          // Inline code
          const $inline = cheerio.load(instance.render('`👍`').html)
          expect($inline('code > img[data-marp-twemoji]')).toHaveLength(1)

          // Code block
          const $block = cheerio.load(instance.render('```\n👍\n```').html)
          expect($block('pre > code > img[data-marp-twemoji]')).toHaveLength(1)

          // Fence
          const $fence = cheerio.load(instance.render('\t👍👍👍').html)
          expect($fence('pre > code > img[data-marp-twemoji]')).toHaveLength(3)
        })

        it('does not convert unicode emoji in HTML attribute', () => {
          const { html } = instance.render('```<😃>\n```')
          expect(html).toContain('<code class="language-&lt;😃&gt;">')
        })

        it('follows variation sequence', () => {
          const $text = cheerio.load(instance.render('# ➡\u{fe0e}').html)
          expect($text('h1 > img[data-marp-twemoji]')).toHaveLength(0)

          const $emoji = cheerio.load(instance.render('# ➡\u{fe0f}').html)
          expect($emoji('h1 > img[data-marp-twemoji]')).toHaveLength(1)
        })
      })

      context('with false', () => {
        const emoji: EmojiOptions = { unicode: false }
        const instance = marp({ emoji })

        it('does not inject unicode emoji renderer', () =>
          expect(instance.markdown.renderer.rules.unicode_emoji).toBeFalsy())

        it('does not convert unicode emoji', () =>
          expect(instance.render('# 👍').html).toContain('<h1>👍</h1>'))
      })

      context('with true', () => {
        const emoji: EmojiOptions = { unicode: true }
        const instance = marp({ emoji })

        it('injects unicode emoji renderer', () =>
          expect(instance.markdown.renderer.rules.unicode_emoji).toBeTruthy())

        it('does not convert unicode emoji', () =>
          expect(instance.render('# 👍').html).toContain('<h1>👍</h1>'))
      })
    })

    describe('twemojiBase option', () => {
      const instance = (emoji: EmojiOptions = {}) => new Marp({ emoji })

      it('uses twemoji CDN by default', () => {
        const $ = cheerio.load(instance().render('# :ok_hand:').html)
        const src = $('h1 > img[data-marp-twemoji]').attr('src')

        expect(src).toBe('https://twemoji.maxcdn.com/2/svg/1f44c.svg')
      })

      it('uses specified base when twemojiBase option is defined', () => {
        const marp = instance({ twemojiBase: '/assets/twemoji/' })
        const $ = cheerio.load(marp.render('# :ok_hand:').html)
        const src = $('h1 > img[data-marp-twemoji]').attr('src')

        expect(src).toBe('/assets/twemoji/svg/1f44c.svg')
      })
    })
  })

  describe('html option', () => {
    it('sanitizes HTML tag by default', () => {
      const { html } = marp().render('<b>abc</b>')
      const $ = cheerio.load(html)

      expect($('b')).toHaveLength(0)
    })

    context('with true', () => {
      it('renders HTML tag', () => {
        const { html } = marp({ html: true }).render('<b>abc</b>')
        const $ = cheerio.load(html)

        expect($('b')).toHaveLength(1)
      })
    })
  })

  describe('math option', () => {
    const inline = "Euler's equation is defined as $e^{i\\pi}+1=0$."
    const block = '$$\nc=\\sqrt{a^2+b^2}\n$$'

    const checkWebFont = (...urls) =>
      postcss([
        root => {
          root.walkAtRules('font-face', rule => {
            rule.walkDecls('src', decl => {
              urls.forEach(url => expect(decl.value).toContain(url))
            })
          })
        },
      ])

    it('renders math typesetting by KaTeX', () => {
      const { html } = marp().render(`${inline}\n\n${block}`)
      const $ = cheerio.load(html)

      expect($('.katex')).toHaveLength(2)
    })

    it('injects KaTeX css with replacing web font URL to CDN', () => {
      const { css } = marp().render(block)
      expect(css).toContain('.katex')

      return checkWebFont(
        "url('https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/fonts/KaTeX_Mock.woff2')",
        "url('https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/fonts/KaTeX_Mock.woff')",
        "url('https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/fonts/KaTeX_Mock.ttf')"
      ).process(css, { from: undefined })
    })

    context('when math typesetting syntax is not using', () => {
      const ret = marp().render('plain text')

      it('does not inject KaTeX css', () =>
        expect(ret.css).not.toContain('.katex'))
    })

    context('with katexOption', () => {
      it('renders KaTeX with specified option', () => {
        const instance = marp({
          math: { katexOption: { macros: { '\\RR': '\\mathbb{R}' } } },
        })
        const { html } = instance.render(`# $\\RR$\n\n## $\\mathbb{R}$`)
        const $ = cheerio.load(html)

        const h1 = $('h1')
        h1.find('annotation').remove()

        const h2 = $('h2')
        h2.find('annotation').remove()

        expect(h1.html()).toBe(h2.html())
      })

      context('when throwOnError is true', () => {
        const instance = marp({
          math: { katexOption: { throwOnError: true } },
        })

        it('fallbacks to plain text on raising error', () => {
          const warnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {})

          const inlineHTML = instance.render('# Fallback to text $}$!').html
          const $inline = cheerio.load(inlineHTML)

          expect(warnSpy.mock.calls).toHaveLength(1)
          expect($inline('h1').text()).toBe('Fallback to text }!')

          const blockHTML = instance.render('$$\n}\n$$').html
          const $block = cheerio.load(blockHTML)
          const blockText = $block('p').text()

          expect(warnSpy.mock.calls).toHaveLength(2)
          expect(blockText.trim()).toBe('}')
        })
      })
    })

    context('with katexFontPath', () => {
      const katexFontPath = '/resources/fonts/'

      it('replaces KaTeX web font URL with specified path', () => {
        const instance = marp({ math: { katexFontPath } })
        const { css } = instance.render(block)

        return checkWebFont(
          "url('/resources/fonts/KaTeX_Mock.woff2')",
          "url('/resources/fonts/KaTeX_Mock.woff')",
          "url('/resources/fonts/KaTeX_Mock.ttf')"
        ).process(css, { from: undefined })
      })

      context('as false', () => {
        it('does not replace KaTeX web font URL', () => {
          const instance = marp({ math: { katexFontPath: false } })
          const { css } = instance.render(block)

          return checkWebFont(
            'url(fonts/KaTeX_Mock.woff2)',
            "url('fonts/KaTeX_Mock.woff')",
            "url('fonts/KaTeX_Mock.ttf')"
          ).process(css, { from: undefined })
        })
      })
    })

    context('with false', () => {
      const instance = marp({ math: false })

      it('does not render KaTeX', () => {
        const inlineHTML = instance.render(`# ${inline}`).html
        const $inline = cheerio.load(inlineHTML)

        expect($inline('.katex')).toHaveLength(0)
        expect($inline('h1').text()).toContain(inline)

        const blockHTML = instance.render(block).html
        const $block = cheerio.load(blockHTML)

        expect($inline('.katex')).toHaveLength(0)
        expect($block('section').text()).toContain(block)
      })

      it('does not inject KaTeX css', () => {
        const { css } = instance.render(`${inline}\n\n${block}`)
        expect(css).not.toContain('.katex')
      })
    })
  })

  describe('Element fitting', () => {
    it('prepends CSS about fitting', () => {
      const { css } = marp().render('')

      expect(css).toContain("svg[data-marp-fitting='svg']")
      expect(css).toContain('[data-marp-fitting-svg-content]')
    })

    context('when fit comment keyword contains in heading', () => {
      const markdown = '# <!--fit--> fitting'

      it('wraps by <svg data-marp-fitting="svg">', () => {
        const { html } = marp().render(markdown)
        const $ = cheerio.load(html, {
          lowerCaseAttributeNames: false,
          lowerCaseTags: false,
        })
        const svgContent = $(
          [
            'h1',
            'svg[data-marp-fitting="svg"]',
            'foreignObject',
            'span[data-marp-fitting-svg-content]',
          ].join('>')
        )

        expect(svgContent).toHaveLength(1)
        expect($('h1').text()).toContain('fitting')
      })

      it('wraps by <span data-marp-fitting="plain"> with disabled inlineSVG mode', () => {
        const { html } = marp({ inlineSVG: false }).render(markdown)
        const $ = cheerio.load(html)

        expect($('h1 > span[data-marp-fitting="plain"]')).toHaveLength(1)
        expect($('h1').text()).toContain('fitting')
      })
    })
  })

  describe('themeSet property', () => {
    const { themeSet } = new Marp()

    it('has default theme', () => {
      expect(themeSet.default).toBeTruthy()
      expect(themeSet.default).toBe(themeSet.get('default'))
    })
  })

  describe('#highlighter', () => {
    context('when fence is rendered without lang', () => {
      const $ = cheerio.load(marp().markdown.render('```\n# test\n```'))

      it('highlights code automatically', () =>
        expect($('code > [class^="hljs-"]').length).toBeGreaterThan(0))
    })

    context('when fence is rendered with specified lang', () => {
      const $ = cheerio.load(marp().markdown.render('```markdown\n# test\n```'))

      it('highlights code with specified lang', () => {
        expect($('code.language-markdown')).toHaveLength(1)
        expect($('code > .hljs-section')).toHaveLength(1)
      })
    })

    // Plain text rendering
    ;['text', 'plain', 'noHighlight', 'no-highlight'].forEach(lang => {
      context(`when fence is rendered with ${lang} lang`, () => {
        const $ = cheerio.load(
          marp().markdown.render(`\`\`\`${lang}\n# test\n\`\`\``)
        )

        it('disables highlight', () =>
          expect($('code > [class^="hljs-"]')).toHaveLength(0))
      })
    })

    context('with overriden #highlighter', () => {
      const instance = marp()

      instance.highlighter = (code, lang) => {
        expect(code.trim()).toBe('test')
        expect(lang).toBe('markdown')

        return '<b class="customized">customized</b>'
      }

      const $ = cheerio.load(instance.markdown.render('```markdown\ntest\n```'))

      it('highlights with custom highlighter', () =>
        expect($('code > .customized')).toHaveLength(1))
    })
  })

  describe('.ready', () => {
    it('throws error in node environment', () =>
      expect(() => Marp.ready()).toThrowError())

    context('when window object is defined in global', () => {
      beforeEach(() => (global['window'] = jest.fn()))
      afterEach(() => delete global['window'])

      it('registers observers for browser only once', () => {
        Marp.ready()
        expect(browser).toHaveBeenCalledTimes(1)

        Marp.ready()
        expect(browser).toHaveBeenCalledTimes(1)
      })
    })
  })
})
