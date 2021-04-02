import { Marpit, Options, Theme } from '@marp-team/marpit'
import cheerio from 'cheerio'
import postcss, { AtRule, Rule } from 'postcss'
import { markdown as sizePlugin } from '../../src/size/size'

interface CollectedDecls {
  [k: string]: string | CollectedDecls
}

const metaType = { size: Array }

describe('Size plugin', () => {
  const marpit = (
    callback: (marpit: Marpit) => void = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    opts?: Options
  ) =>
    new Marpit(opts).use(sizePlugin).use(({ marpit }) => {
      marpit.themeSet.metaType = metaType
      callback(marpit)
    })

  const collectDecls = async (
    css: string,
    selector = 'div.marpit > section'
  ) => {
    const collectedDecls: CollectedDecls = {}

    await postcss([
      {
        postcssPlugin: 'postcss-collect-decl-walker',
        Root: (root) => {
          const collect = (rule: Rule | AtRule, to: CollectedDecls) =>
            rule.walkDecls(({ prop, value }) => {
              to[prop] = value
            })

          root.walkRules(selector, (rule) => collect(rule, collectedDecls))
          root.walkAtRules((atRule) => {
            const name = `@${atRule.name}`
            const current = collectedDecls[name]
            const obj =
              typeof current === 'object' ? current : ({} as CollectedDecls)

            collectedDecls[name] = obj
            collect(atRule, obj)
          })
        },
      },
    ]).process(css, { from: undefined })

    return collectedDecls
  }

  it('defines size custom global directive', () =>
    expect(marpit().customDirectives.global.size).toBeTruthy())

  describe('when specified theme has theme metadata', () => {
    const initializeTheme = (m) => {
      m.themeSet.add('/* @theme a *//* @size test 640px 480px */')
      m.themeSet.add(
        '/* @theme b *//* @size test2 800px 600px  */\n@import "a";'
      )
      m.themeSet.add('/* @theme c *//* @size test 6px 4px */\n@import "a";')
      m.themeSet.add(
        '/* @theme d *//* @size test false *//* @size test2 - invalid defintion */\n@import "b";'
      )
    }

    const instance = marpit(initializeTheme)
    const inlineSVGinstance = marpit(initializeTheme, { inlineSVG: true })

    it('adds width and height style for section and @page rule', async () => {
      const { css } = instance.render('<!-- theme: a -->\n<!-- size: test -->')
      expect(css).not.toBe(instance.render('<!-- theme: a -->').css)

      const decls = await collectDecls(css)
      expect(decls.width).toBe('640px')
      expect(decls.height).toBe('480px')
      expect(decls['@page']).toHaveProperty('size', '640px 480px')
    })

    it('reverts manipulated theme after rendering', () => {
      const baseWidth = instance.themeSet.getThemeProp('', 'width')
      const baseHeight = instance.themeSet.getThemeProp('', 'height')

      instance.render('<!-- theme: a -->\n<!-- size: test -->')

      expect(instance.themeSet.getThemeProp('a', 'width')).toBe(baseWidth)
      expect(instance.themeSet.getThemeProp('a', 'height')).toBe(baseHeight)
    })

    it('exposes selected size into <section> element as data-size attribute', () => {
      const { html } = instance.render('<!--\ntheme: a\nsize: test\n-->\n\n---')
      const $ = cheerio.load(html)
      const attrs = $('section')
        .map((_, e) => $(e).data('size'))
        .get()

      expect(attrs).toStrictEqual(['test', 'test'])

      // Apply data attribute to each layers of advanced background in inline SVG mode
      const { html: htmlAdv } = inlineSVGinstance.render(
        '<!--\ntheme: a\nsize: test\n-->\n\n![bg](dummy)'
      )
      const $adv = cheerio.load(htmlAdv)
      const attrsAdv = $adv('section')
        .map((_, e) => $adv(e).data('size'))
        .get()

      expect(attrsAdv).toStrictEqual(['test', 'test', 'test'])
    })

    it('ignores undefined size name', () => {
      const { css } = instance.render('<!-- theme: a -->\n<!-- size: dummy -->')
      expect(css).toBe(instance.render('<!-- theme: a -->').css)
    })

    it('does not expose undefined size as data-size attribute', () => {
      const { html } = instance.render('<!--\ntheme: a\nsize: dummy\n-->')
      const $ = cheerio.load(html)

      expect($('section').data('size')).toBeUndefined()
    })

    it('ignores invalid size directive', () => {
      const { css } = instance.render(
        '<!-- theme: a -->\n<!-- size: ["test"] -->'
      )
      expect(css).toBe(instance.render('<!-- theme: a -->').css)
    })

    it('allows using defined size in imported theme', async () => {
      const { css } = instance.render('<!-- theme: b -->\n<!-- size: test -->')
      const decls = await collectDecls(css)

      expect(decls.width).toBe('640px')
      expect(decls.height).toBe('480px')
      expect(decls['@page']).toHaveProperty('size', '640px 480px')
    })

    it('can override defined size in inherited theme', async () => {
      const { css } = instance.render('<!-- theme: c -->\n<!-- size: test -->')
      const decls = await collectDecls(css)

      expect(decls.width).toBe('6px')
      expect(decls.height).toBe('4px')
      expect(decls['@page']).toHaveProperty('size', '6px 4px')
    })

    it('can disable defined size in inherited theme by `@size [name] false`', async () => {
      const { css } = instance.render('<!-- theme: d -->\n<!-- size: test -->')
      expect(css).toBe(instance.render('<!-- theme: d -->').css)
    })
  })

  describe('when default theme has size metadata', () => {
    const defaultCSS = '/* @theme a *//* @size test 640px 480px */'
    const defaultTheme = Theme.fromCSS(defaultCSS, { metaType })

    const instance = marpit((m) => {
      m.themeSet.default = defaultTheme
    })

    it('adds width and height style for section', async () => {
      const { css } = instance.render('<!-- size: test -->')
      const { width, height } = await collectDecls(css)

      expect(width).toBe('640px')
      expect(height).toBe('480px')
    })

    it('reverts manipulated theme after rendering', () => {
      instance.render('<!-- size: test -->')

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const defaultTheme = instance.themeSet.default!

      expect(defaultTheme.css).toBe(defaultCSS)
      expect(defaultTheme.width).toBeUndefined()
      expect(defaultTheme.height).toBeUndefined()
    })
  })
})
