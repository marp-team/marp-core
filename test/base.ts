import { Marpit } from '@marp-team/marpit'
import { transformerNotationHighlight } from '@shikijs/transformers'
import { load, CheerioOptions } from 'cheerio'
import { Marp, MarpOptions } from '../src/marp'
import { katexMarpCorePlugin } from '../src/plugins/katex'
import { shikiMarpCorePlugin } from '../src/plugins/shiki'

describe('Marp (Base)', () => {
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

  it('extends Marpit', () => expect(marp()).toBeInstanceOf(Marpit))

  describe('Plugin features', () => {
    it('has no highlights in the code block', () => {
      const { html } = marp().render(
        '```javascript\nconsole.log("Hello, world!")\n```',
      )
      const $ = loadCheerio(html)

      expect($('code').children()).toHaveLength(0)
    })

    it('has no mermaid diagram SVG in the code block', () => {
      const { html } = marp().render(
        '```mermaid\nsequenceDiagram\nAlice->>Bob: Hello Bob, how are you?\nBob-->>Alice: I am good thanks!\n```',
      )
      const $ = loadCheerio(html)

      expect($('code').children()).toHaveLength(0)
    })

    describe('Math plugins', () => {
      it('has no inline math formula', () => {
        const { html } = marp().render('$y=ax^2$')
        const $ = loadCheerio(html)

        expect($('p').children()).toHaveLength(0)
        expect($('p').text()).toBe('$y=ax^2$')
      })

      it('has no math formula block', () => {
        const { html } = marp().render('$$ y=ax^2 $$')
        const $ = loadCheerio(html)

        expect($('p').children()).toHaveLength(0)
        expect($('p').text()).toBe('$$ y=ax^2 $$')
      })

      describe('when a math plugin is used', () => {
        const marpWithMath: typeof marp = (opts?) =>
          new Marp(opts).use(katexMarpCorePlugin())

        it('renders math formula always in a registered math library', () => {
          const $inline = loadCheerio(marpWithMath().render('$y=x^2$').html)
          expect($inline('.katex-html').children()).toHaveLength(2)

          const $block = loadCheerio(marpWithMath().render('$$ y=x^2 $$').html)
          expect($block('.katex-html').children()).toHaveLength(2)

          const $mathjaxOpt = loadCheerio(
            marpWithMath({ math: 'mathjax' }).render('$y=x^2$').html,
          )
          expect($mathjaxOpt('.katex-html').children()).toHaveLength(2)

          const $mathjaxDirective = loadCheerio(
            marpWithMath().render('<!-- math: mathjax -->\n\n$y=x^2$').html,
          )
          expect($mathjaxDirective('.katex-html').children()).toHaveLength(2)
        })
      })
    })

    describe('Shiki plugin', () => {
      const marpWithShiki: typeof marp = (opts?) =>
        new Marp(opts).use(shikiMarpCorePlugin())

      it('allows customizing Shiki transformers by Marp.shikiTransformers member', () => {
        const marpShiki = marpWithShiki()
        const marpShikiWithTransformer = marpWithShiki().use(
          ({ marpit: marp }) => {
            marp.shikiTransformers.push(transformerNotationHighlight())
          },
        )

        const $1 = loadCheerio(
          marpShiki.render(
            `
\`\`\`javascript {2-3}
console.log("Line 1");
console.log("Line 2");
console.log("Line 3");
\`\`\`
`.trim(),
          ).html,
        )

        const $2 = loadCheerio(
          marpShikiWithTransformer.render(
            `
\`\`\`javascript
console.log("Line 1");
console.log("Line 2"); // [!code highlight]
console.log("Line 3"); // [!code highlight]
\`\`\`
`.trim(),
          ).html,
        )

        expect($1('.line.highlighted')).toHaveLength(
          $2('.line.highlighted').length,
        )
      })
    })
  })
})
