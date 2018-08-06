# @marp-team/marp-core

[![CircleCI](https://img.shields.io/circleci/project/github/marp-team/marp-core/master.svg?style=flat-square)](https://circleci.com/gh/marp-team/marp-core/)
[![Codecov](https://img.shields.io/codecov/c/github/marp-team/marp-core/master.svg?style=flat-square)](https://codecov.io/gh/marp-team/marp-core)

**The core of [Marp](https://github.com/marp-team/marp) converter.**

In order to use on Marp tools, we have extended from the slide deck framework **[Marpit](https://github.com/marp-team/marpit)**. You can use the practical Markdown syntax, advanced features, and official themes.

### :warning: _marp-core is under construction and not ready to use._

## Basic usage

We provide `Marp` class, that is inherited from [Marpit](https://github.com/marp-team/marpit).

```javascript
import Marp from '@marp-team/marp-core'

// Convert Markdown slide deck into HTML and CSS
const marp = new Marp()
const { html, css } = marp.render('# Hello, marp-core!')
```

## Features

_We will only explain features extended in marp-core._ Please refer [@marp-team/marpit](https://github.com/marp-team/marpit) repository to if you want to know the basic feature of Marpit framework.

### Math typesetting

We have [Pandoc's Markdown style](https://pandoc.org/MANUAL.html#math) math typesetting support by [KaTeX](https://khan.github.io/KaTeX/). Surround your formula by `$...$` to render math as inline, and `$$...$$` to render as block.

<table>
<thead>
<tr>
<th style="text-align:center;">Markdown</th>
<th style="text-align:center;">Rendered slide</th>
</tr>
</thead>
<tbody>
<tr>
<td>

```tex
Render inline math such as $ax^2+bc+c$.

$$ I_{xx}=\int\int_Ry^2f(x,y)\cdot{}dydx $$

$$
f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi
$$
```

</td>
<td>

![Math typesetting support](https://user-images.githubusercontent.com/3993388/43712050-cea4dd94-99af-11e8-9ea7-e2c49e0f07c1.png)

</td>
</tbody>
</table>

## Constructor option

You can customize a behavior of Marp parser by passing option argument to the constructor. You can also pass together with [Marpit's constructor option](https://marpit.netlify.com/marpit#Marpit).

```javascript
const marp = new Marp({
  // marp-core constructor options
  html: false,
  math: {
    katexFontPath: '/resources/fonts/',
  },

  // Marpit constructor options
  inlineSVG: true,
})
```

### `html`: <small>`boolean`</small>

Setting whether to render raw HTML in Markdown. The default value is `true`.

Even if you are setting `false`, `<!-- HTML comment -->` is always parsed by Marpit for directives. When you are not disabled Marpit's `inlineStyle` option by `false`, `<style>` tag are parsed too for tweaking theme style.

### `math`: <small>`boolean` | `object`</small>

Enable or disable [math typesetting](#math-typesetting) syntax. The default value is `true`.

You can modify KaTeX further settings by passing an object of sub-options.

- **`katexOption`**: `object`
  - The options passing to KaTeX. Please refer to [KaTeX document](https://khan.github.io/KaTeX/docs/options.html).
- **`katexFontPath`**: `string` | `false`
  - By default, marp-core will use [online web-font resources through jsDelivr CDN](https://cdn.jsdelivr.net/npm/katex@latest/dist/fonts/). You have to set path to fonts directory if you want to use local resources. If you set `false`, we will not manipulate the path (Use KaTeX's original path: `fonts/KaTeX_***-***.woff2`).

<!-- ## [Work in progress] Themes -->

## Author

Managed by [@marp-team](https://github.com/marp-team).

- <img src="https://github.com/yhatt.png" width="16" height="16"/> Yuki Hattori ([@yhatt](https://github.com/yhatt))

## License

[MIT License](LICENSE)
