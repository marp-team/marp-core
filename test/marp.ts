import { load, CheerioOptions } from 'cheerio'
import postcss, { Rule } from 'postcss'
import { elements } from '../src/custom-elements/definitions'
import { EmojiOptions } from '../src/emoji/emoji'
import { Marp, MarpOptions } from '../src/full'
import * as generatedMathJax from '../src/generated/mathjax-tex-packages'
import * as mermaid from '../src/internals/mermaid'
import { Marp as MarpBase } from '../src/marp'
import browserScript from '../src/script/browser-script'

jest.mock('../src/plugins/katex/katex.scss?inline')

afterEach(() => jest.restoreAllMocks())

describe('Marp (Full bundle)', () => {
  const marp = (opts?: MarpOptions): Marp => new Marp(opts)

  const loadCheerio = (html: string, opts?: CheerioOptions) =>
    load(html, {
      ...opts,
      xml: {
        lowerCaseAttributeNames: false,
        lowerCaseTags: false,
        ...(typeof opts?.xml === 'object' ? opts.xml : {}),
      },
    })

  it('extends base Marp class', () => expect(marp()).toBeInstanceOf(MarpBase))

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
        marp({ markdown: { typographer: true } }).markdown.render('"(c)"'),
      )
      expect($('p').text()).toBe('“©”')
    })
  })

  describe('Marpit options', () => {
    describe('cssContainerQuery option', () => {
      it('is enabled by default', () => {
        const { css } = marp().render('')
        expect(css).toContain('container-type:size')
      })

      it('can disable by setting cssContainerQuery constructor option as false', () => {
        const { css } = marp({ cssContainerQuery: false }).render('')
        expect(css).not.toContain('container-type')
      })

      it('can assign container name by setting cssContainerQuery constructor option as string or the array of strings', () => {
        const single = marp({ cssContainerQuery: 'name' }).render('')
        expect(single.css).toContain('container-type:size')
        expect(single.css).toContain('container-name:name')

        const multi = marp({ cssContainerQuery: ['name1', 'name2'] }).render('')
        expect(multi.css).toContain('container-type:size')
        expect(multi.css).toContain('container-name:name1 name2')
      })
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
            render('# :smiling_face_with_three_hearts:').html,
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
        const instance = marp({ emoji, slug: false })

        it("does not inject Marp's unicode emoji renderer", () =>
          expect(
            instance.markdown.renderer.rules.marp_unicode_emoji,
          ).toBeFalsy())

        it('does not convert unicode emoji', () =>
          expect(instance.render('# 👍').html).toContain('<h1>👍</h1>'))
      })

      describe('with true', () => {
        const emoji: EmojiOptions = { unicode: true }
        const instance = marp({ emoji, slug: false })

        it("injects Marp's unicode emoji renderer", () =>
          expect(
            instance.markdown.renderer.rules.marp_unicode_emoji,
          ).toBeTruthy())

        it('does not convert unicode emoji', () =>
          expect(instance.render('# 👍').html).toContain('<h1>👍</h1>'))
      })
    })

    describe('twemoji option', () => {
      const instance = (twemoji: EmojiOptions['twemoji'] = {}) =>
        new Marp({ emoji: { twemoji } })

      const emojiSrc = (emoji: string, marp = instance()) => {
        const $ = load(marp.render(`# ${emoji}`).html)
        return $('h1 > img').attr('src')
      }

      it('uses SVG via jsDelivr CDN by default', () => {
        expect(emojiSrc(':ok_hand:')).toMatchInlineSnapshot(
          `"https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/1f44c.svg"`,
        )
      })

      describe('base option', () => {
        it('uses specified base', () =>
          expect(
            emojiSrc(':+1:', instance({ base: '/assets/twemoji/' })),
          ).toMatchInlineSnapshot(`"/assets/twemoji/svg/1f44d.svg"`))

        it("uses Twemoji's default CDN if the base option was undefined", () =>
          expect(
            emojiSrc(':+1:', instance({ base: undefined })),
          ).toMatchInlineSnapshot(
            `"https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/1f44d.svg"`,
          ))
      })

      describe('ext option', () => {
        it('uses PNG emoji by setting png', () =>
          expect(
            emojiSrc(':+1:', instance({ ext: 'png' })),
          ).toMatchInlineSnapshot(
            `"https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/72x72/1f44d.png"`,
          ))
      })
    })
  })

  describe('html option', () => {
    describe('with default option', () => {
      it('allows known HTML tags by default', () => {
        const $b = load(marp().render('<b>abc</b>').html)
        expect($b('b')).toHaveLength(1)

        const $span = load(marp().render('<span>abc</span>').html)
        expect($span('span')).toHaveLength(1)

        const $div = load(marp().render('<div class="test">abc</div>').html)
        expect($div('div.test')).toHaveLength(1)

        const $br = load(marp().render('allow<br>break').html)
        expect($br('br')).toHaveLength(1)

        const $aHref = load(
          marp().render('<a href="https://example.com/">link</a>').html,
        )
        expect($aHref('a[href="https://example.com/"]')).toHaveLength(1)

        const $img = load(
          marp().render(
            '<img src="https://example.com/hello.jpg" alt="Hello" />',
          ).html,
        )
        expect(
          $img('img[src="https://example.com/hello.jpg"][alt="Hello"]'),
        ).toHaveLength(1)

        const $imgLocal = load(
          marp().render('<img src="./hello.jpg" alt="Hello" />').html,
        )
        expect($imgLocal('img[src="./hello.jpg"][alt="Hello"]')).toHaveLength(1)

        const $imgAbsolute = load(
          marp().render('<img src="/hello.jpg" alt="Hello" />').html,
        )
        expect($imgAbsolute('img[src="/hello.jpg"][alt="Hello"]')).toHaveLength(
          1,
        )

        const $imgSameSchema = load(
          marp().render('<img src="//example.com/hello.jpg" alt="Hello" />')
            .html,
        )
        expect(
          $imgSameSchema('img[src="//example.com/hello.jpg"][alt="Hello"]'),
        ).toHaveLength(1)

        const $imgData = load(
          marp().render(
            `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="Hello" />`,
          ).html,
        )
        expect(
          $imgData('img[src^="data:image/svg+xml"][alt="Hello"]'),
        ).toHaveLength(1)

        const $imgSrcSet = load(
          marp().render(
            '<img src="hello.jpg" alt="Hello" srcset="hello@2x.jpg 2x, data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 3x" />',
          ).html,
        )
        expect(
          $imgSrcSet(
            'img[src="hello.jpg"][srcset="hello@2x.jpg 2x, data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 3x"]',
          ),
        ).toHaveLength(1)

        const $pDir = load(marp().render('<p dir="ltr">ltr</p>').html)
        expect($pDir('p[dir="ltr"]')).toHaveLength(1)

        const $pDirNormalize = load(marp().render('<p dir="LTR">ltr</p>').html)
        expect($pDirNormalize('p[dir="ltr"]')).toHaveLength(1)
      })

      it('does not allow some insecure and invalid elements/attributes', () => {
        // Insecure elements
        expect(
          load(
            marp({ script: false }).render('<script>alert(1)</script>').html,
          )('script'),
        ).toHaveLength(0)
        expect(load(marp().render('<input />').html)('input')).toHaveLength(0)
        expect(load(marp().render('<button />').html)('button')).toHaveLength(0)

        // Insecure attributes
        const $onclick = load(
          marp().render('<a href="#" onclick="alert(1)">test</a>').html,
        )
        expect($onclick('a')).toHaveLength(1)
        expect($onclick('a[onclick]')).toHaveLength(0)

        const $javascriptSchema = load(
          marp().render('<a href="javascript:alert(1)">test</a>').html,
        )
        expect($javascriptSchema('a[href]')).toHaveLength(1)
        expect($javascriptSchema('a[href^="javascript:"]')).toHaveLength(0)

        const $dataSchema = load(
          marp().render(
            "<a href='data:text/html,<script>alert(1)</script>'>test</a>",
          ).html,
        )
        expect($dataSchema('a[href]')).toHaveLength(1)
        expect($dataSchema('a[href^="data:text/html"]')).toHaveLength(0)

        // Invalid schema
        const $ftpSchema = load(
          marp().render('<a href="ftp://example.com">test</a>').html,
        )
        expect($ftpSchema('a[href]')).toHaveLength(1)
        expect($ftpSchema('a[href^="ftp:"]')).toHaveLength(0)

        const $mailtoSchema = load(
          marp().render("<a href='mailto:test@example.com'>mail</a>").html,
        )
        expect($mailtoSchema('a[href]')).toHaveLength(1)
        expect($mailtoSchema('a[href^="mailto:"]')).toHaveLength(0)

        const $imgSrcSet = load(
          marp().render(
            '<img src="hello.jpg" alt="Hello" srcset="hello@2x.jpg 2x, unknown:unknown.jpg 2x" />',
          ).html,
        )
        expect($imgSrcSet('img[src="hello.jpg"]')).toHaveLength(1)
        expect(
          $imgSrcSet('img[src="hello.jpg"][srcset*="unknown"]'),
        ).toHaveLength(0)

        // Invalid attributes
        const $pDirUnknown = load(
          marp().render('<p dir="unknown">unknown</p>').html,
        )
        expect($pDirUnknown('p[dir]')).toHaveLength(1)
        expect($pDirUnknown('p[dir="unknown"]')).toHaveLength(0)
      })

      it('renders void element with normalized', () => {
        expect(marp().render('<br>').html).toContain('<br />')
        expect(marp().render('<br  >').html).toContain('<br />')
        expect(marp().render('<br/>').html).toContain('<br />')
        expect(marp().render('<br />').html).toContain('<br />')
        expect(marp().render('<br class="sanitize">').html).toContain(
          '<br class="sanitize" />',
        )
        expect(marp().render("<br class='sanitize'>").html).toContain(
          '<br class="sanitize" />',
        )
        expect(marp().render(`<br class='"sanitize"'>`).html).toContain(
          '<br class="&quot;sanitize&quot;" />',
        )
        expect(marp().render('<br></br>').html).toContain('<br /><br />')
        expect(marp().render('<BR >').html).toContain('<br />')
      })

      it('does not sanitize header and footer', () => {
        // https://github.com/yhatt/marp/issues/243
        const markdown = '<!--\nheader: "**header**"\nfooter: "*footer*"\n-->'
        const $ = load(marp().render(markdown).html)

        expect($('header > strong')).toHaveLength(1)
        expect($('footer > em')).toHaveLength(1)
      })

      it('sanitizes CDATA section', () => {
        // HTML Living Standard denies using CDATA in HTML context so must be sanitized
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

      it('allows any HTML tag', () => {
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

        // Pass through quotes for attributes
        expect(m.render("<br  class='normalize'>").html).toContain(
          "<br class='normalize' />",
        )
      })

      it('does not escape JavaScript special character within valid <script> HTML block', () => {
        const { html: $script, comments: comments$script } = m.render(
          "<script><!--\nconst script = '<b>test</b>'\n--></script>",
        )
        expect($script).toContain("const script = '<b>test</b>'")
        expect(comments$script[0]).toHaveLength(0)

        // Complex comment
        const complexComment = `
<!--
function complex(a,b)
{

  if (a < b && a < 0) then {
    return 1;

  } else {

    return 0;
  }
}

// ex
>
`.trim()
        const { html: $complex } = m.render(
          `<script>${complexComment}</script>`,
        )
        expect($complex).toContain(complexComment)

        // Case-insensitive tag names, attributes, and script without comment
        const attrsAndScriptWithoutComment = `
<SCRIPT
  type="text/javascript"
  data-script="true">
    console.log(2 > 1 && 1 < 2)
</Script>
`.trim()
        const { html: $attrAndScript } = m.render(attrsAndScriptWithoutComment)
        expect($attrAndScript).toContain(
          '<script type="text/javascript" data-script="true">',
        )
        expect($attrAndScript).toContain('console.log(2 > 1 && 1 < 2)')
      })

      it('does escape JavaScript special character if <script> HTML block has trailing contents', () => {
        // ref: https://spec.commonmark.org/0.31.2/#example-178
        const withTrailingContents = `
<script>
  console.log(2 > 1);
</script> trailing <a href="https://example.com">link</a>
`.trim()
        const { html } = m.render(withTrailingContents)

        expect(html).toContain('console.log(2 &gt; 1);')
        expect(html).toContain(
          '</script> trailing <a href="https://example.com">link</a>',
        )
      })
    })

    describe('with false', () => {
      it('sanitizes tags', () => {
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
          '<img src="a.png" />',
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

      describe('when <script> tag is allowed', () => {
        const m = marp({ html: { script: ['type'] } })

        it('does not escape JavaScript special character within valid <script> HTML block', () => {
          const { html: $script, comments: comments$script } = m.render(
            "<script><!--\nconst script = '<b>test</b>'\n--></script>",
          )
          expect($script).toContain("const script = '<b>test</b>'")
          expect(comments$script[0]).toHaveLength(0)

          // Complex comment
          const complexComment = `
  <!--
  function complex(a,b)
  {

    if (a < b && a < 0) then {
      return 1;

    } else {

      return 0;
    }
  }

  // ex
  >
  `.trim()
          const { html: $complex } = m.render(
            `<script>${complexComment}</script>`,
          )
          expect($complex).toContain(complexComment)

          // Case-insensitive tag names, attributes w/ filter, and script without comment
          const attrsAndScriptWithoutComment = `
<SCRIPT
  type="text/javascript"
  data-script="true">
    console.log(2 > 1 && 1 < 2)
</Script>
`.trim()
          const { html: $attrAndScript } = m.render(
            attrsAndScriptWithoutComment,
          )
          expect($attrAndScript).toContain('<script type="text/javascript">')
          expect($attrAndScript).toContain('console.log(2 > 1 && 1 < 2)')

          // Including incorrect closing (may be malicious)
          const { html: $incorrectClosing } = m.render(
            '<script></script><b>bypass whitelist</b></script>',
          )
          expect($incorrectClosing).toContain(
            '&lt;b&gt;bypass whitelist&lt;/b&gt;',
          )
        })

        it('does escape JavaScript special character if <script> HTML block has trailing contents', () => {
          // ref: https://spec.commonmark.org/0.31.2/#example-178
          const withTrailingContents = `
  <script>
    console.log(2 > 1);
  </script> trailing <a href="https://example.com">link</a>
  `.trim()
          const { html } = m.render(withTrailingContents)

          expect(html).toContain('console.log(2 &gt; 1);')
          expect(html).toContain(
            // Follow allowlist
            '</script> trailing &lt;a href="https://example.com"&gt;link&lt;/a&gt;',
          )
        })
      })
    })

    describe("with markdown-it's xhtmlOut option as false", () => {
      const m = marp({ markdown: { xhtmlOut: false } })

      it('does not normalize void element', () => {
        expect(m.render('<br>').html).toContain('<br>')
        expect(m.render('<br />').html).toContain('<br />')
        expect(m.render('<br class="sanitize">').html).toContain(
          '<br class="sanitize">',
        )
        expect(m.render("<br class='sanitize'>").html).toContain(
          '<br class="sanitize">',
        )
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

    describe('with MathJax (default)', () => {
      it('renders math typesetting by MathJax', () => {
        for (const instance of [
          marp(),
          marp({ math: true }),
          marp({ math: 'mathjax' }),
          marp({ math: {} }),
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
        const renderedMath = (markdown: string, index = 0) => {
          const $ = load(instance.render(markdown).html)
          const container = $('mjx-container').eq(index)

          // MathJax v4 retains the source TeX in data attributes. Ignore that
          // metadata when comparing the rendered structure of expanded macros.
          container
            .find('[data-latex], [data-latex-item]')
            .removeAttr('data-latex')
            .removeAttr('data-latex-item')

          return container.html()
        }

        const plain = renderedMath('$x^2$')
        const defined = renderedMath('$\\def\\foo{x^2}$ $\\foo$', 1)

        expect(defined).toBe(plain)

        // Defined command through \def in another rendering cannot use
        const notDefined = renderedMath('$\\foo$')

        expect(notDefined).not.toBe(plain)
      })

      describe('TeX extensions', () => {
        const renderTeXExtension = (tex: string) => {
          const $ = load(marp({ math: 'mathjax' }).render(`$${tex}$`).html)
          return $('mjx-container').html()
        }

        it('renders cancel TeX extension package', () => {
          expect(renderTeXExtension('\\cancel{x}')).toMatchInlineSnapshot(
            `"<svg style="vertical-align: -0.629ex;" xmlns="http://www.w3.org/2000/svg" width="2.502ex" height="2.233ex" role="img" focusable="false" viewBox="0 -709 1106 987"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math" data-latex="\\cancel{x}"><g data-mml-node="menclose" data-latex="\\cancel{x}"><g transform="translate(267, 0)"><g data-mml-node="mi" data-latex="x"><path data-c="1D465" d="M527 373C527 419 482 442 432 442C389 442 355 419 329 373C308 419 273 442 222 442C173 442 133 419 101 374C74 335 60 306 60 287C60 278 65 273 75 273C84 273 90 278 92 287C111 345 153 413 220 413C253 413 269 392 269 351C269 330 251 252 216 118C199 51 169 18 126 18C112 18 99 21 88 26C114 36 127 54 127 80C127 106 114 119 87 119C54 119 29 91 29 58C29 12 76-11 125-11C167-11 201 12 228 58C247 12 283-11 335-11C383-11 423 12 455 57C482 96 496 125 496 144C496 153 491 158 481 158C472 158 467 153 464 144C447 87 402 18 337 18C304 18 287 38 287 79C287 92 292 120 303 165L337 300C356 375 387 413 431 413C445 413 458 410 469 405C442 396 429 378 429 351C429 325 443 312 470 312C502 312 527 341 527 373Z"></path></g></g><line x1="33.5" y1="-244.5" x2="1072.5" y2="675.5" stroke-width="67"></line></g></g></g></svg>"`,
          )
        })

        it('renders mhchem TeX extension package', () => {
          expect(renderTeXExtension('\\ce{H2O}')).toMatchInlineSnapshot(
            `"<svg style="vertical-align: -0.339ex;" xmlns="http://www.w3.org/2000/svg" width="4.445ex" height="1.959ex" role="img" focusable="false" viewBox="0 -716 1964.6 866"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math" data-latex="\\ce{H2O}"><g data-mml-node="TeXAtom" data-latex="{\\mathrm{H}{\\vphantom{A}}_{\\smash[t]{2}}\\mathrm{O}}" data-mjx-texclass="ORD"><g data-mml-node="TeXAtom" data-latex="\\mathrm{H}" data-mjx-texclass="ORD"><g data-mml-node="mi" data-latex="H"><path data-c="48" d="M566 3C640 3 690 2 716 0L716 39L688 39C653 39 632 41 625 46C618 51 614 63 614 81L614 602C614 620 618 631 625 636C632 641 653 644 688 644L716 644L716 683C690 681 640 680 567 680C492 680 442 681 417 683L417 644L444 644C479 644 500 641 507 636C514 631 518 620 518 602L518 375L231 375L231 602C231 620 235 631 242 636C249 641 270 644 305 644L332 644L332 683C307 681 257 680 183 680C109 680 59 681 33 683L33 644L61 644C96 644 117 641 124 636C131 631 135 620 135 602L135 81C135 63 131 51 124 46C117 41 96 39 61 39L33 39L33 0C59 2 109 3 182 3C257 3 307 2 332 0L332 39L305 39C270 39 249 41 242 46C235 51 231 63 231 81L231 336L518 336L518 81C518 63 514 51 507 46C500 41 479 39 444 39L417 39L417 0C442 2 492 3 566 3Z"></path></g></g><g data-mml-node="msub" data-latex="{\\vphantom{A}}_{\\smash[t]{2}}" transform="translate(750,0)"><g data-mml-node="TeXAtom" data-latex="{\\vphantom{A}}" data-mjx-texclass="ORD"><g data-mml-node="TeXAtom" data-latex="\\vphantom{A}" data-mjx-texclass="ORD"><g data-mml-node="mpadded"><g data-mml-node="mphantom"></g></g></g></g><g data-mml-node="TeXAtom" transform="translate(33,-150) scale(0.707)" data-latex="{\\smash[t]{2}}" data-mjx-texclass="ORD"><g data-mml-node="TeXAtom" data-latex="\\smash[t]{2}" data-mjx-texclass="ORD"><g data-mml-node="mpadded"><g data-mml-node="mn" data-latex="2"><path data-c="32" d="M237 666C186 666 143 648 106 612C69 576 50 534 50 483C50 449 75 424 106 424C136 424 161 450 161 480C161 513 137 536 105 536C102 536 100 536 98 535C117 584 161 627 224 627C306 627 352 556 352 470C352 403 318 331 250 255L62 43C49 28 50 29 50 0L421 0L450 180L417 180C409 129 402 100 396 91C391 86 361 84 306 84L139 84L236 179C304 243 390 312 419 365C439 400 449 435 449 470C449 588 357 666 237 666Z"></path></g></g></g></g></g><g data-mml-node="TeXAtom" data-latex="\\mathrm{O}" data-mjx-texclass="ORD" transform="translate(1186.6,0)"><g data-mml-node="mi" data-latex="O"><path data-c="4F" d="M388-22C484-22 564 15 628 88C690 158 721 242 721 339C721 436 690 521 629 592C564 667 484 705 388 705C292 705 212 667 148 592C87 521 56 436 56 339C56 242 87 159 148 88C213 15 293-22 388-22M557 575C593 522 611 448 611 353C611 230 585 140 533 84C488 36 440 12 389 12C337 12 288 36 243 85C192 141 166 230 166 353C166 472 193 558 247 609C293 651 340 672 388 672C456 672 512 640 557 575Z"></path></g></g></g></g></g></svg>"`,
          )
        })

        it('renders mathtools TeX extension package', () => {
          expect(renderTeXExtension('a\\coloneqq b')).toMatchInlineSnapshot(
            `"<svg style="vertical-align: -0.025ex;" xmlns="http://www.w3.org/2000/svg" width="5.632ex" height="1.595ex" role="img" focusable="false" viewBox="0 -694 2489.6 705"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math" data-latex="a\\coloneqq b"><g data-mml-node="mi" data-latex="a"><path data-c="1D44E" d="M498 144C498 153 493 158 482 158C474 158 468 151 465 137C445 58 421 18 394 18C377 18 368 32 368 60C368 73 372 97 381 132L438 357C443 376 445 387 445 392C445 412 434 422 412 422C391 422 377 410 370 387C349 424 319 442 281 442C216 442 159 409 109 343C63 281 40 217 40 150C40 63 91-11 175-11C218-11 260 12 300 58C311 20 345-11 392-11C461-11 482 70 498 144M341 374C350 353 355 339 355 330C355 326 354 321 353 314L304 122C301 111 294 99 285 87C248 41 212 18 177 18C138 18 118 48 118 107C118 131 124 167 136 215C157 300 187 357 224 388C244 405 263 413 282 413C309 413 329 400 341 374Z"></path></g><g data-mml-node="TeXAtom" data-latex="\\mathrel{\\MTThinColon=}" data-mjx-texclass="REL" transform="translate(806.8,0)"><g data-mml-node="mpadded" data-latex="\\MTThinColon"><g transform="translate(-40,40)"><g data-mml-node="mo"><path data-c="3A" d="M192 375C192 405 169 431 139 431C109 431 86 405 86 375C86 345 109 319 139 319C169 319 192 345 192 375M192 56C192 86 169 112 139 112C109 112 86 86 86 56C86 26 109 0 139 0C169 0 192 26 192 56Z"></path></g></g></g><g data-mml-node="mo" data-latex="=" transform="translate(198,0)"><path data-c="3D" d="M698 367L80 367C64 367 56 359 56 344C56 329 64 321 80 321L698 321C714 321 722 329 722 344C722 356 711 367 698 367M698 179L80 179C64 179 56 171 56 156C56 141 64 133 80 133L698 133C714 133 722 141 722 156C722 169 711 179 698 179Z"></path></g></g><g data-mml-node="mi" data-latex="b" transform="translate(2060.6,0)"><path data-c="1D44F" d="M281 445C245 445 209 428 174 394L243 679C241 688 238 694 226 694C193 694 120 685 107 684C92 682 84 675 84 660C84 650 93 645 112 645C131 645 157 646 157 632C157 628 152 608 143 571L63 249C52 207 47 173 47 148C47 62 93-11 175-11C240-11 297 22 347 89C392 151 415 216 415 283C415 370 364 445 281 445M279 415C318 415 337 385 337 326C337 299 331 263 319 218C297 133 268 75 233 44C213 27 194 19 175 19C134 19 114 51 114 115C114 137 119 170 129 214L151 304C154 319 159 330 165 338C204 389 242 415 279 415Z"></path></g></g></g></svg>"`,
          )
        })

        it('renders units TeX extension package', () => {
          expect(renderTeXExtension('\\units{kg}')).toMatchInlineSnapshot(
            `"<svg style="vertical-align: -0.466ex;" xmlns="http://www.w3.org/2000/svg" width="2.326ex" height="2.036ex" role="img" focusable="false" viewBox="0 -694 1028 900"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math" data-latex="\\units{kg}"><g data-mml-node="TeXAtom" data-latex="\\mathrm{kg}" data-mjx-texclass="ORD"><g data-mml-node="mi" data-latex="kg"><path data-c="6B" d="M422 3C442 4 472 3 511 0L511 39C487 39 469 42 457 47C445 52 431 66 415 89L290 266C287 275 285 278 285 275C285 276 295 285 316 303C351 334 377 354 394 365C425 384 456 394 488 396L488 434C467 432 443 431 416 431C370 431 332 432 301 434L301 396C320 395 330 388 330 375C330 363 323 351 310 339L178 224L178 694L28 683L28 645C64 645 86 642 94 636C102 630 105 616 105 593L105 79C105 60 101 48 94 44C87 40 65 39 28 39L28 0L139 3L251 0L251 39C214 39 193 40 186 44C179 48 175 60 175 79L175 179L233 230L249 206C314 116 347 66 347 57C347 45 335 39 311 39L311 0Z"></path><path data-c="67" d="M431 453C393 453 358 438 326 408C296 431 262 442 223 442C137 442 59 378 59 294C59 252 74 218 104 192C85 168 75 141 75 110C75 72 88 43 113 24C71 10 28-26 28-77C28-120 56-154 111-178C153-197 199-206 249-206C300-206 347-197 389-178C444-154 471-120 471-75C471-22 449 17 405 42C359 67 308 70 234 70C190 70 166 70 161 71C133 75 113 102 113 133C113 148 117 162 126 174C154 155 186 145 223 145C309 145 386 209 386 293C386 332 373 364 347 389C372 412 399 423 428 423C423 418 420 410 420 400C420 378 431 367 453 367C474 367 485 378 485 401C485 432 461 453 431 453M223 411C277 411 304 372 304 294C304 215 277 175 223 175C168 175 141 214 141 293C141 372 168 411 223 411M164 4L222 4C274 4 316 1 348-6C391-15 412-39 412-77C412-109 392-134 352-153C321-168 287-175 250-175C214-175 180-168 148-153C107-134 87-109 87-77C87-35 123 4 164 4Z" transform="translate(528,0)"></path></g></g></g></g></svg>"`,
          )
        })
      })

      describe('math global directive', () => {
        it('allows to switch rendering library from katex to mathjax', () => {
          const instance = marp({ math: 'katex' })
          const { html, css } = instance.render(
            `<!-- math: mathjax -->\n\n${inline}\n\n${block}`,
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
            `<!-- math: katex -->\n\n${inline}\n\n${block}`,
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
              `<!-- math: ${keyword} -->\n\n${inline}`,
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
        it('does not initialize MathJax', () => {
          const loadTexPackages = jest.spyOn(
            generatedMathJax,
            'loadTexPackages',
          )

          marp({ math: 'mathjax' }).render('plain text')
          expect(loadTexPackages).not.toHaveBeenCalled()
        })

        it('does not inject MathJax css', () =>
          expect(
            marp({ math: 'mathjax' }).render('plain text').css,
          ).not.toContain('mjx-container'))
      })
    })

    describe('with KaTeX', () => {
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

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        postcss([walkerPlugin]).process(css, { from: undefined }).css

        return walkedUrls
      }

      it('renders math typesetting by KaTeX', () => {
        for (const instance of [
          marp({ math: 'katex' }),
          marp({ math: { lib: 'katex' } }),
        ]) {
          const { html } = instance.render(`${inline}\n\n${block}`)
          const $ = load(html)

          expect($('.katex')).toHaveLength(2)
        }
      })

      it('injects KaTeX css with replacing web font URL to CDN', () => {
        const { css } = marp({ math: 'katex' }).render(block)
        expect(css).toContain('.katex')

        const katexFonts = pickKaTeXWebFont(css)
        for (const url of katexFonts) {
          expect(url).toContain('https://cdn.jsdelivr.net/npm/katex')
        }

        expect(katexFonts).toMatchSnapshot('katex-css-cdn')
      })

      it('has a unique context for macro by Markdown rendering', () => {
        const instance = marp({ math: 'katex' })

        const plain = load(instance.render('$x^2$').html)('.katex-html').html()

        // KaTeX can modify macros through \gdef
        const globallyDefined = load(
          instance.render('$\\gdef\\foo{x^2}$ $\\foo$').html,
        )('.katex-html')
          .eq(1)
          .html()

        expect(globallyDefined).toBe(plain)

        // Defined command through \gdef in another rendering cannot use
        const notDefined = load(instance.render('$\\foo$').html)(
          '.katex-html',
        ).html()

        expect(notDefined).not.toBe(plain)
      })

      describe('when math typesetting syntax is not using', () => {
        it('does not inject KaTeX css', () =>
          expect(
            marp({ math: 'katex' }).render('plain text').css,
          ).not.toContain('.katex'))
      })

      describe('[DEPRECATED] with katexOption', () => {
        it('renders KaTeX with specified option', () => {
          const instance = marp({
            math: {
              lib: 'katex',
              katexOption: { macros: { '\\RR': '\\mathbb{R}' } },
            },
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
            math: { lib: 'katex', katexOption: { throwOnError: true } },
          })

          it('fallbacks to plain text on raising error', () => {
            const warnSpy = jest
              .spyOn(console, 'warn')
              .mockImplementation(() => {})

            const inlineHTML = instance.render('# Fallback to text $}$!').html
            const $inline = load(inlineHTML)

            expect(warnSpy.mock.calls).toHaveLength(1)
            expect($inline('h1').text()).toBe('Fallback to text $}$!')

            const blockHTML = instance.render('$$\n}\n$$').html
            const $block = load(blockHTML)
            const blockText = $block('p').text()

            expect(warnSpy.mock.calls).toHaveLength(2)
            expect(blockText.trim()).toBe('$$}\n$$')
          })

          it('prevents rendering raw HTML when fallbacking to plain text', () => {
            const warnSpy = jest
              .spyOn(console, 'warn')
              .mockImplementation(() => {})

            const inlineHTML = instance.render(
              '$}<img src=x onerror="alert(1)">$',
            ).html
            const $inline = load(inlineHTML)

            expect(warnSpy.mock.calls).toHaveLength(1)
            expect($inline('img')).toHaveLength(0)
            expect($inline('p').text()).toContain('$')
            expect($inline('p').text()).toContain(
              '<img src=x onerror="alert(1)">',
            )

            const blockHTML = instance.render(
              '$$}<img src=x onerror="alert(1)">$$',
            ).html
            const $block = load(blockHTML)

            expect(warnSpy.mock.calls).toHaveLength(2)
            expect($block('img')).toHaveLength(0)
            expect($block('p').text()).toContain('$$')
            expect($block('p').text()).toContain(
              '<img src=x onerror="alert(1)">',
            )
          })
        })
      })

      describe('[DEPRECATED] with katexFontPath', () => {
        const katexFontPath = '/resources/fonts/'

        it('replaces KaTeX web font URL with specified path', () => {
          const instance = marp({ math: { lib: 'katex', katexFontPath } })
          const { css } = instance.render(block)

          const katexFonts = pickKaTeXWebFont(css)
          for (const url of katexFonts) expect(url).toContain(katexFontPath)

          expect(katexFonts).toMatchSnapshot('katex-css-replace')
        })

        describe('as false', () => {
          it('does not replace KaTeX web font URL', () => {
            const instance = marp({
              math: { lib: 'katex', katexFontPath: false },
            })
            const { css } = instance.render(block)

            const katexFonts = pickKaTeXWebFont(css)
            for (const url of katexFonts) expect(url).toContain('fonts/')

            expect(katexFonts).toMatchSnapshot('katex-css-noops')
          })
        })
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
            /^https:\/\/cdn\.jsdelivr\.net\/npm\/@marp-team\/marp-core@.+\/lib\/browser-iife\.iife\.js$/,
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

  describe('slug option', () => {
    it('makes slugs for headings by default', () => {
      const { html } = marp().render('# a\n\n---\n\n## b\n\n---\n\n### a')
      const $ = load(html)

      expect($('h1').attr('id')).toBe('a')
      expect($('h2').attr('id')).toBe('b')
      expect($('h3').attr('id')).toBe('a-1')
    })

    describe('with undefined (default)', () => {
      it('makes slugs for headings', () => {
        const { html } = marp({ slug: undefined }).render('# a\n\n---\n\n## b')
        const $ = load(html)

        expect($('h1').attr('id')).toBe('a')
        expect($('h2').attr('id')).toBe('b')
      })
    })

    describe('with false', () => {
      it('does not make slugs for headings', () => {
        const { html } = marp({ slug: false }).render('# a\n\n---\n\n## b')
        const $ = load(html)

        expect($('h1').attr('id')).toBeUndefined()
        expect($('h2').attr('id')).toBeUndefined()
      })
    })

    describe('with custom slugifier', () => {
      it('makes slugs for headings by custom slugifier', () => {
        const slugifier = (s: string) => `custom:${s}`
        const { html } = marp({ slug: slugifier }).render('# abc')
        const $ = load(html)

        expect($('h1').attr('id')).toBe('custom:abc')
      })
    })

    describe('with option object', () => {
      it('allows slugifier option', () => {
        const slugifier = (s: string) => `custom:${s}`

        expect(marp({ slug: { slugifier } }).render('# abc').html).toBe(
          marp({ slug: slugifier }).render('# abc').html,
        )
      })

      it('allows postSlugify option, to deal with duplicate slugs', () => {
        const postSlugify = (s: string, i: number) => `${'-'.repeat(i)}${s}`
        const { html } = marp({ slug: { postSlugify } }).render(
          '# abc\n\n---\n\n## abc\n\n---\n\n### abc',
        )
        const $ = load(html)

        expect($('h1').attr('id')).toBe('abc')
        expect($('h2').attr('id')).toBe('-abc')
        expect($('h3').attr('id')).toBe('--abc')
      })
    })

    describe('with duplicated slug with slide anchor', () => {
      it('adds index to duplicated slug', () => {
        const { html } = marp().render('# 1')
        const $ = load(html)

        expect($('h1').attr('id')).toBe('1-1')
      })

      it('recongizes custom anchor generation', () => {
        const { html } = marp({ anchor: (i) => `slide-${i + 1}` }).render(
          '# Slide 1',
        )
        const $ = load(html)

        expect($('h1').attr('id')).toBe('slide-1-1')
      })
    })

    describe('with <!--fit--> annotation', () => {
      it('ignores the annotation comment in the slug', () => {
        const { html } = marp().render('# <!--fit--> a')
        const $ = load(html)

        expect($('h1').attr('id')).toBe('a')
      })
    })

    describe('when the heading tokens has surrounded a non inline token', () => {
      it('ignores non inline elements in the slug', () => {
        const { html } = marp()
          .use((md) => {
            md.core.ruler.before('marp_slug', 'marp_test', (state) => {
              for (let i = 0; i < state.tokens.length; i += 1) {
                if (state.tokens[i].type === 'heading_open') {
                  const token = new state.Token('test', '', 0)
                  token.content = 'test'
                  state.tokens.splice(i + 1, 0, token)
                }
              }
            })
          })
          .render('# abc')

        const $ = load(html)
        expect($('h1').attr('id')).toBe('abc')
      })
    })
  })

  describe('Auto scaling', () => {
    describe('when fit comment keyword contains in heading (Fitting header)', () => {
      const baseMd = '# <!--fit--> fitting'

      for (const markdown of [
        baseMd,
        `text\n\n${baseMd}`, // Fitting header with content
        `${baseMd}\n\n## <!--fit--> fitting2`, // Multiple headers
      ]) {
        it('adds attributes for heading custom element', () => {
          const { html, comments } = marp().render(markdown)
          const h1 = loadCheerio(html)('h1')

          expect(h1).toHaveLength(1)
          expect(h1.attr('is')).toBe('marp-h1')
          expect(h1.is('[data-auto-scaling]')).toBe(true)
          expect(h1.text()).toContain('fitting')

          expect(comments[0]).toHaveLength(0)
        })

        it('does not add attributes for heading custom element if disabled inlineSVG mode', () => {
          const $ = loadCheerio(
            marp({ inlineSVG: false }).render(markdown).html,
          )

          expect($('h1').attr('is')).not.toBe('marp-h1')
          expect($('h1').text()).toContain('fitting')
        })
      }
    })

    describe('with code block (Auto scaling for code block)', () => {
      const markdown = '\tCODE BLOCK'

      it('adds attributes for pre custom element', () => {
        const $ = loadCheerio(marp().render(markdown).html)
        const pre = $('pre')

        expect(pre).toHaveLength(1)
        expect(pre.attr('is')).toBe('marp-pre')
        expect(pre.is('[data-auto-scaling="downscale-only"]')).toBe(true)
        expect(pre.text()).toContain('CODE BLOCK')
      })

      it('does not add attributes for pre custom element if disabled inlineSVG mode', () => {
        const $ = loadCheerio(marp({ inlineSVG: false }).render(markdown).html)
        const pre = $('pre')

        expect(pre.attr('is')).not.toBe('marp-pre')
        expect(pre.is('[data-auto-scaling]')).toBe(false)
        expect(pre.text()).toContain('CODE BLOCK')
      })

      it('does not add attributes for pre custom element if not enabled auto scaling by theme metadata', () => {
        const instance = marp()
        instance.themeSet.add('/* @theme test */')

        const $ = loadCheerio(
          instance.render(`<!-- theme: test -->\n\n${markdown}`).html,
        )
        const pre = $('pre')

        expect(pre.attr('is')).not.toBe('marp-pre')
        expect(pre.is('[data-auto-scaling]')).toBe(false)
        expect(pre.text()).toContain('CODE BLOCK')
      })
    })

    describe('with fence (Auto scaling for fence)', () => {
      const markdown = '```typescript\nconst a = 1\n```'

      it('adds attributes for pre custom element', () => {
        const $ = loadCheerio(marp().render(markdown).html)
        const pre = $('pre')

        expect(pre).toHaveLength(1)
        expect(pre.attr('is')).toBe('marp-pre')
        expect(pre.is('[data-auto-scaling="downscale-only"]')).toBe(true)
        expect(pre.text()).toContain('const a = 1')
      })

      it('does not add attributes for pre custom element if disabled inlineSVG mode', () => {
        const $ = loadCheerio(marp({ inlineSVG: false }).render(markdown).html)
        const pre = $('pre')

        expect(pre.attr('is')).not.toBe('marp-pre')
        expect(pre.is('[data-auto-scaling]')).toBe(false)
        expect(pre.text()).toContain('const a = 1')
      })

      it('does not add attributes for pre custom element if not enabled auto scaling by theme metadata', () => {
        const instance = marp()
        instance.themeSet.add('/* @theme test */')

        const $ = loadCheerio(
          instance.render(`<!-- theme: test -->\n\n${markdown}`).html,
        )
        const pre = $('pre')

        expect(pre.attr('is')).not.toBe('marp-pre')
        expect(pre.is('[data-auto-scaling]')).toBe(false)
        expect(pre.text()).toContain('const a = 1')
      })
    })

    describe('with KaTeX math block', () => {
      const markdown = '$$ y=ax^2 $$'

      it('adds attributes for span custom element', () => {
        const $ = loadCheerio(marp({ math: 'katex' }).render(markdown).html)
        const katex = $('span.katex-display')

        expect(katex).toHaveLength(1)
        expect(katex.attr('is')).toBe('marp-span')
        expect(katex.is('[data-auto-scaling="downscale-only"]')).toBe(true)
      })

      it('does not add attributes for span custom element if disabled inlineSVG mode', () => {
        const $ = loadCheerio(
          marp({ math: 'katex', inlineSVG: false }).render(markdown).html,
        )
        const katex = $('span.katex-display')

        expect(katex.attr('is')).not.toBe('marp-span')
        expect(katex.is('[data-auto-scaling]')).toBe(false)
      })

      it('does not add attributes for span custom element if not enabled auto scaling by theme metadata', () => {
        const instance = marp({ math: 'katex' })
        instance.themeSet.add('/* @theme test */')

        const $ = loadCheerio(
          instance.render(`<!-- theme: test -->\n\n${markdown}`).html,
        )
        const katex = $('span.katex-display')

        expect(katex.attr('is')).not.toBe('marp-span')
        expect(katex.is('[data-auto-scaling]')).toBe(false)
      })

      describe('with MathJax', () => {
        it('does not use custom element because it has already supported auto-scaling', () => {
          const $ = loadCheerio(marp({ math: 'mathjax' }).render(markdown).html)
          expect($('[is="marp-span"]')).toHaveLength(0)
          expect($('[data-auto-scaling]')).toHaveLength(0)
        })
      })
    })

    describe('Postprocess for rendered css', () => {
      for (const el of Object.keys(elements)) {
        it(`replaces the selector for <${el}> to :is(${el}, marp-${el})`, () => {
          const decl = `${el} { color: #f00; }`

          // Custom theme
          const instance = marp({ minifyCSS: false })
          instance.themeSet.add(`/* @theme a */ ${decl}`)

          expect(instance.render('<!--theme: a-->').css).toContain(
            `:is(${el}, marp-${el})`,
          )

          // Inline style
          expect(instance.render(`<style>${decl}</style>`).css).toContain(
            `:is(${el}, marp-${el})`,
          )
        })
      }

      it('covers possible cases in complex selectors', () => {
        const transformedDecl = (decl: string) => {
          const instance = marp({ minifyCSS: false, container: false })
          const css = instance.render(`<style>${decl} {test: test}</style>`).css

          let ret: string | undefined

          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          postcss({
            postcssPlugin: 'transformed-decl',
            Declaration: {
              test: (decl) => {
                if (decl.parent?.type === 'rule') {
                  const { selectors } = decl.parent as Rule

                  ret = selectors
                    .map((sel) =>
                      sel.replace('svg > foreignObject > section ', ''),
                    )
                    .join(', ')
                }
              },
            },
          }).process(css, { from: undefined }).css

          return ret
        }

        // Matched cases
        expect(transformedDecl('h1')).toBe(':is(h1, marp-h1)')
        expect(transformedDecl('h1, h2')).toBe(
          ':is(h1, marp-h1), :is(h2, marp-h2)',
        )
        expect(transformedDecl('h1 > h1')).toBe(
          ':is(h1, marp-h1) > :is(h1, marp-h1)',
        )
        expect(transformedDecl('div:not(h1)')).toBe('div:not(:is(h1, marp-h1))')
        expect(transformedDecl(':is(h1, h2)')).toBe(
          ':is(:is(h1, marp-h1), :is(h2, marp-h2))',
        )
        expect(transformedDecl(':where(h1, h2)')).toBe(
          ':where(:is(h1, marp-h1), :is(h2, marp-h2))',
        )
        expect(transformedDecl('test::slotted(h1)')).toBe(
          'test::slotted(:is(h1, marp-h1))',
        )

        // Unmatched cases
        expect(transformedDecl('.h1')).toBe('.h1')
        expect(transformedDecl('#h1')).toBe('#h1')
        expect(transformedDecl('[is=h1]')).toBe('[is=h1]')
        expect(transformedDecl('h1-like')).toBe('h1-like')
        expect(transformedDecl('test:h1')).toBe('test:h1')
        expect(transformedDecl('test::h1')).toBe('test::h1')
        expect(transformedDecl('test::part(h1)')).toBe('test::part(h1)')
      })
    })
  })

  describe('minifyCSS option', () => {
    it('applies minifier to rendered css', () => {
      const enabled = marp({ minifyCSS: true })
      const disabled = marp({ minifyCSS: false })

      expect(enabled.render('').css.length).toBeLessThan(
        disabled.render('').css.length,
      )

      // Custom theme
      const customTheme =
        '/* @theme a */\n@media screen and (min-width : 768px)  { div { color: #f00; }  }'

      enabled.themeSet.add(customTheme)
      disabled.themeSet.add(customTheme)

      const enabledCss = enabled.render('<!-- theme: a -->').css
      const disabledCss = disabled.render('<!-- theme: a -->').css

      expect(disabledCss).toContain('div { color: #f00; }')
      expect(enabledCss).toContain('div{color:#f00}')
      expect(enabledCss.split('\n').length).toBeLessThan(
        disabledCss.split('\n').length,
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
          loadCheerio(html, { xmlMode: true })('foreignObject').attr(),
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

      it('does not highlight code', () => {
        expect($('pre.shiki')).toHaveLength(0)
      })
    })

    describe('when fence is rendered with specified lang', () => {
      const $ = load(marp().markdown.render('```markdown\n# test\n```'))

      it('highlights code with specified lang', () => {
        expect($('pre.shiki')).toHaveLength(1)
        expect($('pre.shiki code.language-markdown')).toHaveLength(1)
        expect($('pre.shiki [style*="font-weight:bold"]')).toHaveLength(1)
      })
    })

    describe(`when fence is rendered with unexpected lang`, () => {
      const $ = load(marp().markdown.render(`\`\`\`unexpected\n# test\n\`\`\``))

      it('disables highlight', () => {
        expect($('pre.shiki')).toHaveLength(0)
      })
    })

    describe(`when fence is rendered with text lang`, () => {
      const $ = load(marp().markdown.render(`\`\`\`text\n# test\n\`\`\``))

      it('enables highlight', () => {
        expect($('pre.shiki')).toHaveLength(1)
      })
    })

    describe(`when fence is rendered with text lang with attributes`, () => {
      const $ = load(marp().markdown.render(`\`\`\`text {1}\n# test\n\`\`\``))

      it('enables highlight with a highlighted line', () => {
        expect($('pre.shiki')).toHaveLength(1)
        expect($('pre.shiki .line.highlighted')).toHaveLength(1)
      })
    })

    describe('Mermaid diagram', () => {
      const diagram = 'flowchart TD\nA --> B\n'

      describe('when fence is rendered with mermaid lang', () => {
        it('renders Mermaid diagram', () => {
          const render = jest.spyOn(mermaid, 'beautifulMermaid')
          const $ = load(
            marp().markdown.render(`\`\`\`mermaid\n${diagram}\`\`\``),
          )

          expect(render).toHaveBeenCalledWith(
            diagram,
            expect.objectContaining({ interactive: false }),
          )
          expect($('code.language-mermaid > svg')).toHaveLength(1)
        })

        it('enables interactive rendering through fence attributes', () => {
          const render = jest.spyOn(mermaid, 'beautifulMermaid')
          const $ = load(
            marp().markdown.render(
              `\`\`\`mermaid interactive\n${diagram}\`\`\``,
            ),
          )

          expect(render).toHaveBeenCalledWith(
            diagram,
            expect.objectContaining({ interactive: true }),
          )
          expect($('code.language-mermaid > svg')).toHaveLength(1)
        })

        it('falls back to regular syntax highlighting when Mermaid rendering fails', () => {
          const err = new Error('Failed to render Mermaid diagram')

          jest.spyOn(mermaid, 'beautifulMermaid').mockImplementation(() => {
            throw err
          })

          const warn = jest.spyOn(console, 'warn').mockImplementation()
          const $ = load(
            marp().markdown.render(`\`\`\`mermaid\n${diagram}\`\`\``),
          )

          expect(warn).toHaveBeenCalledWith(err)
          expect($('pre.shiki code.language-mmd')).toHaveLength(1)
          expect($('code').text()).toBe(diagram.trimEnd())
        })
      })

      describe('when fence is rendered with mermaid-raw lang', () => {
        it('highlights Mermaid syntax without rendering a diagram', () => {
          const render = jest.spyOn(mermaid, 'beautifulMermaid')
          const $ = load(
            marp().markdown.render(`\`\`\`mermaid-raw\n${diagram}\n\`\`\``),
          )

          expect(render).not.toHaveBeenCalled()
          expect($('pre.shiki code.language-mmd')).toHaveLength(1)
          expect($('code').text()).toBe(diagram)
        })
      })
    })

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

      it('highlights with custom highlighter', () => {
        expect.assertions(4)

        const $ = load(
          instance.markdown.render('```markdown {attrs}\ntest\n```'),
        )

        expect($('code .customized')).toHaveLength(1)
      })
    })
  })

  describe('shikiTransformers field', () => {
    it('allows to add custom Shiki transformer', () => {
      const instance = marp()

      instance.shikiTransformers.push({
        code(node) {
          this.addClassToHast(node, 'transformed')
        },
      })

      const $ = load(instance.markdown.render('```md\ntest\n```'))

      expect($('pre.shiki code.language-md')).toHaveLength(1)
      expect($('pre.shiki code.language-md.transformed')).toHaveLength(1)
    })
  })
})
