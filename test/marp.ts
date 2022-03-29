import { Marpit } from '@marp-team/marpit'
import { load, CheerioOptions } from 'cheerio'
import postcss from 'postcss'
import { EmojiOptions } from '../src/emoji/emoji'
import { Marp, MarpOptions } from '../src/marp'
import browserScript from '../src/script/browser-script'

jest.mock('../src/observer')
jest.mock('../src/math/katex.scss')

afterEach(() => jest.restoreAllMocks())

describe('Marp', () => {
  const marp = (opts?: MarpOptions): Marp => new Marp(opts)

  const loadCheerio = (html: string, opts?: CheerioOptions) =>
    load(html, {
      lowerCaseAttributeNames: false,
      lowerCaseTags: false,
      ...opts,
    })

  it('extends Marpit', () => expect(marp()).toBeInstanceOf(Marpit))

  describe('markdown option', () => {
    it('renders breaks as <br> element', () => {
      const $ = load(marp().markdown.render('hard\nbreak'))
      expect($('br')).toHaveLength(1)
    })

    it('has enabled table syntax', () => {
      const $ = load(marp().markdown.render('|a|b|\n|-|-|\n|c|d|'))
      expect($('table > thead > tr > th')).toHaveLength(2)
      expect($('table > tbody > tr > td')).toHaveLength(2)
    })

    it('converts URL to hyperlink', () => {
      const address = 'https://www.google.com/'
      const $ = load(marp().markdown.render(address))
      expect($(`a[href="${address}"]`).text()).toBe(address)
    })

    it('has enabled strikethrough syntax', () => {
      const $ = load(marp().markdown.render('~~strikethrough~~'))
      expect($('s')).toHaveLength(1)
    })

    it('can enable typographer option by markdown option', () => {
      const $original = load(marp().markdown.render('"(c)"'))
      expect($original('p').text()).toBe('"(c)"')

      const $ = load(
        marp({ markdown: { typographer: true } }).markdown.render('"(c)"')
      )
      expect($('p').text()).toBe('“©”')
    })
  })

  describe('emoji option', () => {
    describe('shortcode option', () => {
      it('converts emoji shorthand to twemoji image by default', () => {
        const { html, css } = marp().render('# :heart:')
        const $ = load(html)

        expect($('h1 > img[data-marp-twemoji][alt="❤️"]')).toHaveLength(1)
        expect(css).toContain('img[data-marp-twemoji]')
      })

      describe('with true', () => {
        const emoji: EmojiOptions = { shortcode: true }

        it('converts emoji shorthand to unicode emoji', () => {
          const { render } = marp({ emoji })

          const $heart = load(render('# :heart:').html)
          expect($heart('h1').html()).toBe('\u2764\ufe0f')

          const $smiling = load(
            render('# :smiling_face_with_three_hearts:').html
          )
          expect($smiling('h1').html()).toBe('\u{1f970}')
        })
      })

      describe('with false', () => {
        const emoji: EmojiOptions = { shortcode: false }

        it('does not convert emoji shorthand', () => {
          const $ = load(marp({ emoji }).render('# :heart:').html)
          expect($('h1').html()).toBe(':heart:')
        })
      })
    })

    describe('unicode option', () => {
      describe('with twemoji (by default)', () => {
        const instance = marp()

        it('converts unicode emoji to twemoji image', () => {
          const { html, css } = instance.render('# 👍')
          const $ = load(html)

          expect($('h1 > img[data-marp-twemoji][alt="👍"]')).toHaveLength(1)
          expect(css).toContain('img[data-marp-twemoji]')

          // Inline code
          const $inline = load(instance.render('`👍`').html)
          expect($inline('code > img[data-marp-twemoji]')).toHaveLength(1)

          // Code block
          const $block = load(instance.render('```\n👍\n```').html)
          expect($block('pre > code img[data-marp-twemoji]')).toHaveLength(1)

          // Fence
          const $fence = load(instance.render('\t👍👍👍').html)
          expect($fence('pre > code img[data-marp-twemoji]')).toHaveLength(3)
        })

        it('does not convert unicode emoji in HTML attribute', () => {
          const { html } = instance.render('```<😃>\n```')
          expect(html).toContain('<code class="language-&lt;😃&gt;">')
        })

        it('follows variation sequence', () => {
          const $text = load(instance.render('# ➡\u{fe0e}').html)
          expect($text('h1 > img[data-marp-twemoji]')).toHaveLength(0)

          const $emoji = load(instance.render('# ➡\u{fe0f}').html)
          expect($emoji('h1 > img[data-marp-twemoji]')).toHaveLength(1)
        })
      })

      describe('with false', () => {
        const emoji: EmojiOptions = { unicode: false }
        const instance = marp({ emoji })

        it("does not inject Marp's unicode emoji renderer", () =>
          expect(
            instance.markdown.renderer.rules.marp_unicode_emoji
          ).toBeFalsy())

        it('does not convert unicode emoji', () =>
          expect(instance.render('# 👍').html).toContain('<h1>👍</h1>'))
      })

      describe('with true', () => {
        const emoji: EmojiOptions = { unicode: true }
        const instance = marp({ emoji })

        it("injects Marp's unicode emoji renderer", () =>
          expect(
            instance.markdown.renderer.rules.marp_unicode_emoji
          ).toBeTruthy())

        it('does not convert unicode emoji', () =>
          expect(instance.render('# 👍').html).toContain('<h1>👍</h1>'))
      })
    })

    describe('twemoji option', () => {
      const instance = (twemoji: EmojiOptions['twemoji'] = {}) =>
        new Marp({ emoji: { twemoji } })

      it('uses SVG via twemoji CDN by default', () => {
        const $ = load(instance().render('# :ok_hand:').html)
        const src = $('h1 > img[data-marp-twemoji]').attr('src')

        expect(src).toMatchInlineSnapshot(
          `"https://twemoji.maxcdn.com/v/14.0.1/svg/1f44c.svg"`
        )
      })

      describe('base option', () => {
        it('uses specified base', () =>
          expect(
            instance({ base: '/assets/twemoji/' }).render(':+1:').html
          ).toContain('/assets/twemoji/svg/1f44d.svg'))
      })

      describe('ext option', () => {
        it('uses PNG emoji by setting png', () =>
          expect(instance({ ext: 'png' }).render(':+1:').html).toMatch(
            /https:\/\/twemoji\.maxcdn\.com\/[\w/.]+\/1f44d\.png/
          ))
      })
    })
  })

  describe('html option', () => {
    describe('with default option', () => {
      it('sanitizes HTML tag by default', () => {
        const { html } = marp().render('<b>abc</b>')
        expect(load(html)('b')).toHaveLength(0)
      })

      it('allows <br> tag', () => {
        const { html } = marp().render('allow<br>break')
        expect(load(html)('br')).toHaveLength(1)
      })

      it('renders void element with normalized', () => {
        expect(marp().render('<br>').html).toContain('<br />')
        expect(marp().render('<br  >').html).toContain('<br />')
        expect(marp().render('<br/>').html).toContain('<br />')
        expect(marp().render('<br />').html).toContain('<br />')
        expect(marp().render('<br class="sanitize">').html).toContain('<br />')
        expect(marp().render('<br></br>').html).toContain('<br /><br />')
        expect(marp().render('<BR >').html).toContain('<br />')
      })

      // https://github.com/yhatt/marp/issues/243
      it('does not sanitize header and footer', () => {
        const markdown = '<!--\nheader: "**header**"\nfooter: "*footer*"\n-->'
        const $ = load(marp().render(markdown).html)

        expect($('header > strong')).toHaveLength(1)
        expect($('footer > em')).toHaveLength(1)
      })

      it('keeps raw HTML comments within valid HTML block', () => {
        const { html: $script, comments: comments$script } = marp().render(
          "<script><!--\nconst script = '<b>test</b>'\n--></script>"
        )
        expect($script).toContain("const script = '<b>test</b>'")
        expect(comments$script[0]).toHaveLength(0)

        // Complex comment
        const complexComment = `
<!--
function matchwo(a,b)
{

  if (a < b && a < 0) then {
    return 1;

  } else {

    return 0;
  }
}

// ex
-->
`.trim()
        const { html: $complex } = marp().render(
          `<script>${complexComment}</script>`
        )
        expect($complex).toContain(complexComment)

        // NOTE: Marpit framework will collect the comment block if the whole of HTML block was comment
        const { html: $comment, comments: comments$comment } = marp().render(
          "<!--\nconst script = '<b>test</b>'\n-->"
        )
        expect($comment).not.toContain("const script = '<b>test</b>'")
        expect(comments$comment[0]).toHaveLength(1)
      })

      it('sanitizes CDATA section', () => {
        // HTML Living Standard denys using CDATA in HTML context so must be sanitized
        const cdata = `
<![CDATA[
  <p>XSS</p>
  <script>alert('XSS')</script>
]]>
`.trim()
        const { html } = marp().render(cdata)
        expect(html).not.toContain(cdata)
      })
    })

    describe('with true', () => {
      const m = marp({ html: true })

      it('allows HTML tag', () => {
        const { html } = m.render('<b data-custom="test">abc</b>')
        expect(load(html)('b[data-custom="test"]')).toHaveLength(1)
      })

      it('renders void element with normalized', () => {
        expect(m.render('<br>').html).toContain('<br />')
        expect(m.render('<br  >').html).toContain('<br />')
        expect(m.render('<br/>').html).toContain('<br />')
        expect(m.render('<br />').html).toContain('<br />')
        expect(m.render('<br></br>').html).toContain('<br /><br />')
        expect(m.render('<BR >').html).toContain('<br />')
        expect(m.render('<br  class="normalize">').html).toContain(
          '<br class="normalize" />'
        )
      })
    })

    describe('with false', () => {
      it('sanitizes <br> tag', () => {
        const { html } = marp({ html: false }).render('sanitize<br>break')
        expect(load(html)('br')).toHaveLength(0)
      })
    })

    describe('with allowlist', () => {
      const md = '<p>\ntest\n</p>\n\n<p class="class" title="title">test</p>'
      const html = { img: ['src'], p: ['class'] }

      it('allows tags and attributes in allowlist', () => {
        const $ = load(marp({ html }).render(md).html)

        expect($('p')).toHaveLength(2)
        expect($('p.class')).toHaveLength(1)
        expect($('p[title]')).toHaveLength(0)
      })

      it('allows using html option passed to markdown-it option', () => {
        const $ = load(marp({ markdown: { html } }).render(md).html)

        expect($('p')).toHaveLength(2)
        expect($('p.class')).toHaveLength(1)
        expect($('p[title]')).toHaveLength(0)
      })

      it('renders void element with normalized', () => {
        const m = marp({ html })

        expect(m.render('<img src="a.png">').html).toContain(
          '<img src="a.png" />'
        )
        expect(m.render('<img class="test">').html).toContain('<img />')
        expect(m.render('<p>').html).toContain('<p>')
      })

      describe('when attributes are defined as object', () => {
        it('allows attributes in allowlist without defined false', () => {
          const instance = marp({ html: { p: { id: true, class: false } } })
          const { html } = instance.render('<p id="id" class="class"></p>')

          expect(html).toContain('<p id="id"></p>')
        })

        it('applies custom sanitizer to attributes when function is defined', () => {
          const instance = marp({ html: { p: { id: () => 'sanitized' } } })
          const { html } = instance.render('<p id></p>')

          expect(html).toContain('<p id="sanitized"></p>')
        })
      })
    })

    describe("with markdown-it's xhtmlOut option as false", () => {
      const m = marp({ markdown: { xhtmlOut: false } })

      it('does not normalize void element', () => {
        expect(m.render('<br>').html).toContain('<br>')
        expect(m.render('<br />').html).toContain('<br />')
        expect(m.render('<br class="sanitize">').html).toContain('<br>')
        expect(m.render('<br></br>').html).toContain('<br></br>')
      })
    })

    it('allows overriding html option through markdown-it instance', () => {
      const instance = marp()
      instance.markdown.set({ html: { b: [] } })

      const { html } = instance.render('<b>abc</b>')
      expect(load(html)('b')).toHaveLength(1)
    })
  })

  describe('math option', () => {
    const inline = "Euler's equation is defined as $e^{i\\pi}+1=0$."
    const block = '$$\nc=\\sqrt{a^2+b^2}\n$$'

    describe('with KaTeX (default)', () => {
      const pickKaTeXWebFont = (css: string) => {
        const walkedUrls: string[] = []
        const walkerPlugin = {
          postcssPlugin: 'postcss-katex-walker',
          AtRule: (rule) => {
            if (rule.name === 'font-face') {
              rule.walkDecls('src', (e) => {
                if (e.value.includes('KaTeX')) walkedUrls.push(e.value)
              })
            }
          },
        }

        postcss([walkerPlugin]).process(css, { from: undefined }).css
        return walkedUrls
      }

      it('renders math typesetting by KaTeX', () => {
        for (const instance of [
          marp(),
          marp({ math: true }),
          marp({ math: 'katex' }),
          marp({ math: {} }),
          marp({ math: { lib: 'katex' } }),
        ]) {
          const { html } = instance.render(`${inline}\n\n${block}`)
          const $ = load(html)

          expect($('.katex')).toHaveLength(2)
        }
      })

      it('injects KaTeX css with replacing web font URL to CDN', () => {
        const { css } = marp().render(block)
        expect(css).toContain('.katex')

        const katexFonts = pickKaTeXWebFont(css)
        for (const url of katexFonts) {
          expect(url).toContain('https://cdn.jsdelivr.net/npm/katex')
        }

        expect(katexFonts).toMatchSnapshot('katex-css-cdn')
      })

      it('has a unique context for macro by Markdown rendering', () => {
        const instance = marp()

        const plain = load(instance.render('$x^2$').html)('.katex-html').html()

        // KaTeX can modify macros through \gdef
        const globallyDefined = load(
          instance.render('$\\gdef\\foo{x^2}$ $\\foo$').html
        )('.katex-html')
          .eq(1)
          .html()

        expect(globallyDefined).toBe(plain)

        // Defined command through \gdef in another rendering cannot use
        const notDefined = load(instance.render('$\\foo$').html)(
          '.katex-html'
        ).html()

        expect(notDefined).not.toBe(plain)
      })

      describe('when math typesetting syntax is not using', () => {
        it('does not inject KaTeX css', () =>
          expect(marp().render('plain text').css).not.toContain('.katex'))
      })

      describe('with katexOption', () => {
        it('renders KaTeX with specified option', () => {
          const instance = marp({
            math: { katexOption: { macros: { '\\RR': '\\mathbb{R}' } } },
          })
          const { html } = instance.render(`# $\\RR$\n\n## $\\mathbb{R}$`)
          const $ = load(html)

          const h1 = $('h1')
          h1.find('annotation').remove()

          const h2 = $('h2')
          h2.find('annotation').remove()

          expect(h1.html()).toBe(h2.html())
        })

        describe('when throwOnError is true', () => {
          const instance = marp({
            math: { katexOption: { throwOnError: true } },
          })

          it('fallbacks to plain text on raising error', () => {
            const warnSpy = jest
              .spyOn(console, 'warn')
              .mockImplementation(() => {}) // eslint-disable-line @typescript-eslint/no-empty-function

            const inlineHTML = instance.render('# Fallback to text $}$!').html
            const $inline = load(inlineHTML)

            expect(warnSpy.mock.calls).toHaveLength(1)
            expect($inline('h1').text()).toBe('Fallback to text }!')

            const blockHTML = instance.render('$$\n}\n$$').html
            const $block = load(blockHTML)
            const blockText = $block('p').text()

            expect(warnSpy.mock.calls).toHaveLength(2)
            expect(blockText.trim()).toBe('}')
          })
        })
      })

      describe('with katexFontPath', () => {
        const katexFontPath = '/resources/fonts/'

        it('replaces KaTeX web font URL with specified path', () => {
          const instance = marp({ math: { katexFontPath } })
          const { css } = instance.render(block)

          const katexFonts = pickKaTeXWebFont(css)
          for (const url of katexFonts) expect(url).toContain(katexFontPath)

          expect(katexFonts).toMatchSnapshot('katex-css-replace')
        })

        describe('as false', () => {
          it('does not replace KaTeX web font URL', () => {
            const instance = marp({ math: { katexFontPath: false } })
            const { css } = instance.render(block)

            const katexFonts = pickKaTeXWebFont(css)
            for (const url of katexFonts) expect(url).toContain('fonts/')

            expect(katexFonts).toMatchSnapshot('katex-css-noops')
          })
        })
      })
    })

    describe('with MathJax', () => {
      it('renders math typesetting by MathJax', () => {
        for (const instance of [
          marp({ math: 'mathjax' }),
          marp({ math: { lib: 'mathjax' } }),
        ]) {
          const { html } = instance.render(`${inline}\n\n${block}`)
          const $ = load(html)

          expect($('.MathJax')).toHaveLength(2)
        }
      })

      it('injects MathJax css', () => {
        const { css } = marp({ math: 'mathjax' }).render(block)
        expect(css).toContain('mjx-container')
      })

      it('has a unique context for macro by Markdown rendering', () => {
        const instance = marp({ math: 'mathjax' })

        const plain = load(instance.render('$x^2$').html)(
          'mjx-container'
        ).html()

        const defined = load(instance.render('$\\def\\foo{x^2}$ $\\foo$').html)(
          'mjx-container'
        )
          .eq(1)
          .html()

        expect(defined).toBe(plain)

        // Defined command through \def in another rendering cannot use
        const notDefined = load(instance.render('$\\foo$').html)(
          'mjx-container'
        ).html()

        expect(notDefined).not.toBe(plain)
      })

      describe('math global directive', () => {
        it('allows to switch rendering library from katex to mathjax', () => {
          const instance = marp({ math: 'katex' })
          const { html, css } = instance.render(
            `<!-- math: mathjax -->\n\n${inline}\n\n${block}`
          )
          const $ = load(html)

          expect($('.MathJax')).toHaveLength(2)
          expect($('.katex')).not.toHaveLength(2)

          expect(css).toContain('mjx-container')
          expect(css).not.toContain('.katex')
        })

        it('allows to switch rendering library from mathjax to katex', () => {
          const instance = marp({ math: 'mathjax' })
          const { html, css } = instance.render(
            `<!-- math: katex -->\n\n${inline}\n\n${block}`
          )
          const $ = load(html)

          expect($('.MathJax')).not.toHaveLength(2)
          expect($('.katex')).toHaveLength(2)

          expect(css).not.toContain('mjx-container')
          expect(css).toContain('.katex')
        })

        it('ignores if defined unknown keyword', () => {
          const katex = marp({ math: 'katex' })

          for (const keyword of ['unknown', 'false', 'true']) {
            const katexRendered = katex.render(
              `<!-- math: ${keyword} -->\n\n${inline}`
            )
            const $katex = load(katexRendered.html)

            expect($katex('.MathJax')).not.toHaveLength(1)
            expect($katex('.katex')).toHaveLength(1)

            expect(katexRendered.css).not.toContain('mjx-container')
            expect(katexRendered.css).toContain('.katex')
          }
        })
      })

      describe('when math typesetting syntax is not using', () => {
        it('does not inject MathJax css', () =>
          expect(
            marp({ math: 'mathjax' }).render('plain text').css
          ).not.toContain('mjx-container'))
      })
    })

    describe('with false', () => {
      const instance = marp({ math: false })

      it('does not render KaTeX', () => {
        const inlineHTML = instance.render(`# ${inline}`).html
        const $inline = load(inlineHTML)

        expect($inline('.katex')).toHaveLength(0)
        expect($inline('h1').text()).toContain(inline)

        const blockHTML = instance.render(block).html
        const $block = load(blockHTML)

        expect($inline('.katex')).toHaveLength(0)
        expect($block('section').text()).toContain(block)
      })

      it('does not inject KaTeX css', () => {
        const { css } = instance.render(`${inline}\n\n${block}`)
        expect(css).not.toContain('.katex')
      })
    })
  })

  describe('script option', () => {
    it('injects <script> tag for browser context to rendered Markdown by default', () => {
      for (const rendered of [
        marp().render('\n---').html,
        marp().render('\n---', { htmlAsArray: true }).html[1], // Injects to the last page
        marp({ inlineSVG: false }).render('\n---').html,
        marp({ inlineSVG: false }).render('\n---', { htmlAsArray: true })
          .html[1],
      ]) {
        const $ = load(rendered)
        const script = $('script')

        expect(script).toHaveLength(1)
        expect(script.html()).toBe(browserScript)
        expect(script.attr('defer')).toBeUndefined()
        expect(script.attr('nonce')).toBeUndefined()
      }
    })

    describe('when passed false', () => {
      it('does not inject <script> tag', () => {
        const $ = load(marp({ script: false }).render('').html)
        expect($('script')).toHaveLength(0)
      })
    })

    describe('when passed object', () => {
      describe('with source option', () => {
        it('injects <script> tag for jsDelivr CDN', () => {
          const instance = marp({ script: { source: 'cdn' } })
          const $ = load(instance.render('').html)
          const script = $('script')

          expect(script).toHaveLength(1)
          expect(script.html()).toBe('')
          expect(script.attr('src')).toMatch(
            /^https:\/\/cdn\.jsdelivr\.net\/npm\/@marp-team\/marp-core@.+\/lib\/browser\.js$/
          )
          expect(script.attr('defer')).toBeDefined()
        })
      })

      describe('with nonce option', () => {
        it('adds passed nonce to <script> tag', () => {
          for (const rendered of [
            marp({ script: { nonce: 'test' } }).render('').html,
            marp({ script: { nonce: 'test', source: 'cdn' } }).render('').html,
          ]) {
            const $ = load(rendered)
            expect($('script').attr('nonce')).toBe('test')
          }
        })
      })
    })
  })

  describe('Element fitting', () => {
    it('prepends CSS about fitting', () => {
      const { css } = marp().render('')

      expect(css).toContain('svg[data-marp-fitting=svg]')
      expect(css).toContain('[data-marp-fitting-svg-content]')
    })

    describe('when fit comment keyword contains in heading (Fitting header)', () => {
      const baseMd = '# <!--fit--> fitting'

      for (const markdown of [
        baseMd,
        `text\n\n${baseMd}`, // Fitting header with content
        `${baseMd}\n\n## <!--fit--> fitting2`, // Multiple headers
      ]) {
        it('wraps by <svg data-marp-fitting="svg">', () => {
          const { html, comments } = marp().render(markdown)
          const $ = loadCheerio(html, { xmlMode: true })
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
          expect(comments[0]).toHaveLength(0)
        })

        it('wraps by <span data-marp-fitting="plain"> with disabled inlineSVG mode', () => {
          const $ = loadCheerio(
            marp({ inlineSVG: false }).render(markdown).html
          )

          expect($('h1 > span[data-marp-fitting="plain"]')).toHaveLength(1)
          expect($('h1').text()).toContain('fitting')
        })
      }
    })

    describe('with code block (Auto scaling for code block)', () => {
      const markdown = '\tCODE BLOCK'

      it('wraps code block by <svg data-marp-fitting="svg">', () => {
        const $ = loadCheerio(marp().render(markdown).html, { xmlMode: true })
        const svgContent = $(
          [
            'pre',
            'code',
            'svg[data-marp-fitting="svg"][data-marp-fitting-code]',
            'foreignObject',
            'span[data-marp-fitting-svg-content]',
            'span[data-marp-fitting-svg-content-wrap]',
          ].join('>')
        )

        expect(svgContent).toHaveLength(1)
        expect($('pre').text()).toContain('CODE BLOCK')
      })

      it('wraps by <span data-marp-fitting="plain"> with disabled inlineSVG mode', () => {
        const $ = loadCheerio(marp({ inlineSVG: false }).render(markdown).html)

        expect($('pre > code > span[data-marp-fitting="plain"]')).toHaveLength(
          1
        )
        expect($('pre').text()).toContain('CODE BLOCK')
      })

      it('does not wrap by svg when specified uncover theme', () => {
        // Disable object freeze
        jest.spyOn<any, any>(Object, 'freeze').mockImplementation((obj) => obj)

        const instance = marp()
        const theme = instance.themeSet.get('uncover')! // eslint-disable-line @typescript-eslint/no-non-null-assertion
        theme.meta = { ...theme.meta, fittingCode: 'false' }

        const uncover = `---\ntheme: uncover\n---\n\n${markdown}`
        const $ = loadCheerio(instance.render(uncover).html)

        expect($('section svg')).toHaveLength(0)
      })
    })

    describe('with fence (Auto scaling for fence)', () => {
      const markdown = '```typescript\nconst a = 1\n```'

      it('wraps code block by <svg data-marp-fitting="svg">', () => {
        const $ = loadCheerio(marp().render(markdown).html, { xmlMode: true })
        const svgContent = $(
          [
            'pre',
            'code.language-typescript',
            'svg[data-marp-fitting="svg"][data-marp-fitting-code]',
            'foreignObject',
            'span[data-marp-fitting-svg-content]',
            'span[data-marp-fitting-svg-content-wrap]',
          ].join('>')
        )

        expect(svgContent).toHaveLength(1)
        expect($('pre').text()).toContain('const a = 1')
      })

      it('wraps by <span data-marp-fitting="plain"> with disabled inlineSVG mode', () => {
        const $ = loadCheerio(marp({ inlineSVG: false }).render(markdown).html)
        const plainContent = $(
          [
            'pre',
            'code.language-typescript',
            'span[data-marp-fitting="plain"]',
          ].join('>')
        )

        expect(plainContent).toHaveLength(1)
        expect($('pre').text()).toContain('const a = 1')
      })
    })

    describe('with math block', () => {
      const markdown = '$$ y=ax^2 $$'

      it('wraps code block by <svg data-marp-fitting="svg">', () => {
        const $ = loadCheerio(marp().render(markdown).html)
        const svgContent = `${$(
          [
            'p',
            'svg[data-marp-fitting="svg"][data-marp-fitting-math]',
            'foreignObject',
            'span[data-marp-fitting-svg-content]',
            'span[data-marp-fitting-svg-content-wrap]',
          ].join('>')
        )} .katex`

        expect(svgContent.length).toBeTruthy()
      })

      it('wraps by <span data-marp-fitting="plain"> with disabled inlineSVG mode', () => {
        const $ = loadCheerio(marp({ inlineSVG: false }).render(markdown).html)
        const plainContent = $('p > span[data-marp-fitting="plain"] .katex')

        expect(plainContent.length).toBeTruthy()
      })

      describe('with MathJax', () => {
        it('does not wrap math block because it has already supported auto-scaling', () => {
          const $ = loadCheerio(marp({ math: 'mathjax' }).render(markdown).html)
          expect($('[data-marp-fitting]')).toHaveLength(0)
        })
      })
    })
  })

  describe('minifyCSS option', () => {
    it('applies minifier to rendered css', () => {
      const enabled = marp({ minifyCSS: true })
      const disabled = marp({ minifyCSS: false })

      expect(enabled.render('').css.length).toBeLessThan(
        disabled.render('').css.length
      )

      // Custom theme
      const customTheme = '/* @theme a */ h1 { color: #f00; }'

      enabled.themeSet.add(customTheme)
      disabled.themeSet.add(customTheme)

      expect(disabled.render('<!-- theme: a -->').css).toContain(
        'h1 { color: #f00; }'
      )
      expect(enabled.render('<!-- theme: a -->').css).toContain(
        'h1{color:#f00}'
      )
    })

    it('applies minifier by default', () => {
      const { css: minifiedCSS } = marp({ minifyCSS: true }).render('')
      const { css: defaultCSS } = marp().render('')

      expect(minifiedCSS).toBe(defaultCSS)
    })
  })

  describe('size global directive', () => {
    it('defines size custom global directive', () =>
      expect(marp().customDirectives.global.size).toBeTruthy())

    describe('with size directive as 4:3', () => {
      const size = expect.objectContaining({ width: '960', height: '720' })

      it('renders inline SVG with 960x720 size', () => {
        const instance = marp()
        const md = (t: string) => `<!-- theme: ${t} -->\n<!-- size: 4:3 -->`

        const { html } = instance.render('<!-- size: 4:3 -->')
        expect(
          loadCheerio(html, { xmlMode: true })('foreignObject').attr()
        ).toStrictEqual(size)

        for (const theme of instance.themeSet.themes()) {
          const { html: themeHtml } = instance.render(md(theme.name))
          const $ = loadCheerio(themeHtml, { xmlMode: true })

          expect($('foreignObject').attr()).toStrictEqual(size)
        }
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
    describe('when fence is rendered without lang', () => {
      const $ = load(marp().markdown.render('```\n# test\n```'))

      it('does not highlight code', () =>
        expect($('code [class^="hljs-"]')).toHaveLength(0))
    })

    describe('when fence is rendered with specified lang', () => {
      const $ = load(marp().markdown.render('```markdown\n# test\n```'))

      it('highlights code with specified lang', () => {
        expect($('code.language-markdown')).toHaveLength(1)
        expect($('code .hljs-section')).toHaveLength(1)
      })
    })

    // Plain text rendering
    for (const lang of ['text', 'plain', 'noHighlight', 'no-highlight']) {
      describe(`when fence is rendered with ${lang} lang`, () => {
        const $ = load(marp().markdown.render(`\`\`\`${lang}\n# test\n\`\`\``))

        it('disables highlight', () =>
          expect($('code [class^="hljs-"]')).toHaveLength(0))
      })
    }

    describe('with highlight markdown option', () => {
      const instance = marp({ markdown: { highlight: () => 'CUSTOM' } })

      it('allows overriding highlighter', () =>
        expect(instance.markdown.render('```\ntest\n```')).toContain('CUSTOM'))
    })

    describe('with overriden #highlighter', () => {
      const instance = marp()

      instance.highlighter = (code, lang, attrs) => {
        expect(code.trim()).toBe('test')
        expect(lang).toBe('markdown')
        expect(attrs).toBe('{attrs}')

        return '<b class="customized">customized</b>'
      }

      const $ = load(instance.markdown.render('```markdown {attrs}\ntest\n```'))

      it('highlights with custom highlighter', () =>
        expect($('code .customized')).toHaveLength(1))
    })
  })
})
