/**
 * All test cases are ported from markdown-it-katex.
 *
 * @see https://github.com/waylonflinn/markdown-it-katex/blob/master/test/fixtures/default.txt
 */

import MarkdownIt from 'markdown-it'
import { markdown as mathPlugin } from '../../src/math/math'

const countMath = (stt) => stt.split('class="katex"').length - 1
const countBlockMath = (stt) => stt.split('class="katex-display"').length - 1

describe('markdown-it math plugin', () => {
  const md = new MarkdownIt()

  md.marpit = { options: { math: true } }
  md.use(mathPlugin)

  it('renders simple inline math', () => {
    const rendered = md.render('$1+1 = 2$')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders simple block math', () => {
    const rendered = md.render('$$1+1 = 2$$')
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders math without whitespace before and after delimiter', () => {
    const rendered = md.render('foo$1+1 = 2$bar')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders math even when it starts with a negative sign', () => {
    const rendered = md.render('foo$-1+1 = 0$bar')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('does not render with empty content', () => {
    const rendered = md.render('aaa $$ bbb')
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('requires a closing delimiter to render math', () => {
    const rendered = md.render('aaa $5.99 bbb')
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('does not allow paragraph break in inline math', () => {
    const rendered = md.render('foo $1+1\n\n= 2$ bar')
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('does not process apparent markup in inline math', () => {
    const rendered = md.render('foo $1 *i* 1$ bar')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).not.toContain('<em>')
    expect(rendered).toMatchSnapshot()
  })

  it('renders block math with indented up to 3 spaces', () => {
    const rendered = md.render('   $$\n   1+1 = 2\n   $$')
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('does not render block math with indented up to 4 spaces (code block)', () => {
    const rendered = md.render('    $$\n    1+1 = 2\n    $$')
    expect(countBlockMath(rendered)).toBe(0)
    expect(rendered).toContain('<code>')
    expect(rendered).toMatchSnapshot()
  })

  it('renders multiline inline math', () => {
    const rendered = md.render('foo $1 + 1\n= 2$ bar')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders multiline display math', () => {
    const rendered = md.render('$$\n\n  1\n+ 1\n\n= 2\n\n$$')
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('allows to place text immediately after inline math', () => {
    const rendered = md.render('$n$-th order')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders block math with self-closing at the end of document', () => {
    const rendered = md.render('$$\n1+1 = 2')
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('can appear both maths in lists', () => {
    const rendered = md.render('* $1+1 = 2$\n* $$\n  1+1 = 2\n  $$')
    expect(countMath(rendered)).toBe(2)
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders block math written in one line', () => {
    const rendered = md.render('$$1+1 = 2$$')
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('renders block math composed multiple lines with starting/ending expression on delimited lines', () => {
    const rendered = md.render('$$[\n[1, 2]\n[3, 4]\n]$$')
    expect(countBlockMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('does not render math when delimiters are escaped', () => {
    const rendered = md.render('Foo \\$1$ bar\n\\$\\$\n1\n\\$\\$')
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('does not render math when numbers are followed closing inline math', () => {
    const rendered = md.render(
      "Thus, $20,000 and USD$30,000 won't parse as math."
    )
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('requires non whitespace to right of opening inline math', () => {
    const rendered = md.render(
      'For some Europeans, it is 2$ for a can of soda, not 1$.'
    )
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('requires non whitespace to left of closing inline math', () => {
    const rendered = md.render(
      'I will give you $20 today, if you give me more $ tomorrow.'
    )
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('does not recognize inline block math', () => {
    const rendered = md.render(
      "It's well know that $$1 + 1 = 3$$ for sufficiently large 1."
    )
    expect(countMath(rendered)).toBe(0)
    expect(rendered).toMatchSnapshot()
  })

  it('recognizes escaped delimiters in math mode', () => {
    const rendered = md.render('Money adds: $\\$X + \\$Y = \\$Z$.')
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })

  it('recognizes multiline escaped delimiters in math module', () => {
    const rendered = md.render(
      'Weird-o: $\\displaystyle{\\begin{pmatrix} \\$ & 1\\\\\\$ \\end{pmatrix}}$.'
    )
    expect(countMath(rendered)).toBe(1)
    expect(rendered).toMatchSnapshot()
  })
})
