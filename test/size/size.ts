import { Marpit, Theme } from '@marp-team/marpit'
import cheerio from 'cheerio'
import postcss from 'postcss'
import { markdown as sizePlugin } from '../../src/size/size'

const metaType = { size: Array }

describe('Size plugin', () => {
  const marpit = (callback: (marpit: Marpit) => void = () => {}) =>
    new Marpit().use(sizePlugin).use(({ marpit }) => {
      marpit.themeSet.metaType = metaType
      callback(marpit)
    })

  const collectDecls = async (
    css: string,
    selector = 'div.marpit > section'
  ) => {
    const collectedDecls: Record<string, any> = {}

    await postcss([
      root => {
        const collect = (rule: postcss.Rule | postcss.AtRule, to) =>
          rule.walkDecls(({ prop, value }) => {
            to[prop] = value
          })

        root.walkRules(selector, rule => collect(rule, collectedDecls))
        root.walkAtRules(atRule => {
          const name = `@${atRule.name}`

          collectedDecls[name] = collectedDecls[name] || {}
          collect(atRule, collectedDecls[name])
        })
      },
    ]).process(css, { from: undefined })

    return collectedDecls
  }

  it('defines size custom global directive', () =>
    expect(marpit().customDirectives.global.size).toBeTruthy())

  context('when specified theme has theme metadata', () => {
    const instance = marpit(m => {
      m.themeSet.add('/* @theme a *//* @size test 640px 480px */')
      m.themeSet.add(
        '/* @theme b *//* @size test2 800px 600px  */\n@import "a";'
      )
      m.themeSet.add('/* @theme c *//* @size test 6px 4px */\n@import "a";')
      m.themeSet.add(
        '/* @theme d *//* @size test false *//* @size test2 - invalid defintion */\n@import "b";'
      )
    })

    it('adds width and height style for section and @page rule', async () => {
      const { css } = instance.render('<!-- theme: a -->\n<!-- size: test -->')
      expect(css).not.toBe(instance.render('<!-- theme: a -->').css)

      const decls = await collectDecls(css)
      expect(decls.width).toBe('640px')
      expect(decls.height).toBe('480px')
      expect(decls['@page'].size).toBe('640px 480px')
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

      $('section')
        .map((_, e) => $(e).data('size'))
        .each((_, attr) => expect(attr).toBe('test'))
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
      expect(decls['@page'].size).toBe('640px 480px')
    })

    it('can override defined size in inherited theme', async () => {
      const { css } = instance.render('<!-- theme: c -->\n<!-- size: test -->')
      const decls = await collectDecls(css)

      expect(decls.width).toBe('6px')
      expect(decls.height).toBe('4px')
      expect(decls['@page'].size).toBe('6px 4px')
    })

    it('can disable defined size in inherited theme by `@size [name] false`', async () => {
      const { css } = instance.render('<!-- theme: d -->\n<!-- size: test -->')
      expect(css).toBe(instance.render('<!-- theme: d -->').css)
    })
  })

  context('when default theme has size metadata', () => {
    const defaultCSS = '/* @theme a *//* @size test 640px 480px */'
    const defaultTheme = Theme.fromCSS(defaultCSS, { metaType })

    const instance = marpit(m => {
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

      expect(instance.themeSet.default!.css).toBe(defaultCSS)
      expect(instance.themeSet.default!.width).toBeUndefined()
      expect(instance.themeSet.default!.height).toBeUndefined()
    })
  })
})
