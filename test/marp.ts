import { Marpit } from '@marp-team/marpit'
import cheerio from 'cheerio'
import context from './_helpers/context'
import { Marp } from '../src/marp'

describe('Marp', () => {
  const marp = (): Marp => new Marp()

  it('extends Marpit', () => expect(marp()).toBeInstanceOf(Marpit))

  describe('markdown property', () => {
    it('renders breaks as <br> element', () => {
      const $ = cheerio.load(marp().markdown.render('hard\nbreak'))
      expect($('br').length).toBe(1)
    })

    it('has enabled table syntax', () => {
      const $ = cheerio.load(marp().markdown.render('|a|b|\n|-|-|\n|c|d|'))
      expect($('table > thead > tr > th').length).toBe(2)
      expect($('table > tbody > tr > td').length).toBe(2)
    })

    it('converts URL to hyperlink', () => {
      const address = 'https://www.google.com/'
      const $ = cheerio.load(marp().markdown.render(address))
      expect($(`a[href="${address}"]`).text()).toBe(address)
    })

    it('converts emoji shorthand to unicode emoji', () => {
      const $ = cheerio.load(
        marp().markdown.render('# emoji:heart:\n\n## emoji❤️')
      )
      expect($('h1').html()).toBe($('h2').html())
      expect($('h1 > span[data-marpit-emoji]').length).toBe(1)
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
        expect($('code.language-markdown').length).toBe(1)
        expect($('code > .hljs-section').length).toBe(1)
      })
    })

    // Plain text rendering
    ;['text', 'plain', 'noHighlight', 'no-highlight'].forEach(lang => {
      context(`when fence is rendered with ${lang} lang`, () => {
        const $ = cheerio.load(
          marp().markdown.render(`\`\`\`${lang}\n# test\n\`\`\``)
        )

        it('disables highlight', () =>
          expect($('code > [class^="hljs-"]').length).toBe(0))
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
        expect($('code > .customized').length).toBe(1))
    })
  })
})
