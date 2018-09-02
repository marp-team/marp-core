# @marp-team/marp-core

[![CircleCI](https://img.shields.io/circleci/project/github/marp-team/marp-core/master.svg?style=flat-square)](https://circleci.com/gh/marp-team/marp-core/)
[![Codecov](https://img.shields.io/codecov/c/github/marp-team/marp-core/master.svg?style=flat-square)](https://codecov.io/gh/marp-team/marp-core)
[![npm](https://img.shields.io/npm/v/@marp-team/marp-core.svg?style=flat-square)](https://www.npmjs.com/package/@marp-team/marp-core)
[![LICENSE](https://img.shields.io/github/license/marp-team/marp-core.svg?style=flat-square)](./LICENSE)

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

### `Marp.ready()`

`Marp` class has `ready()` static method to work several features correctly. It must run on the browser context by using [Browserify](http://browserify.org/) or [webpack](https://webpack.js.org/).

```javascript
import Marp from '@marp-team/marp-core'

document.addEventListener('DOMContentLoaded', () => {
  Marp.ready()
})
```

#### Separated bundle

We also provide a separated bundle [`lib/browser.js`](https://cdn.jsdelivr.net/npm/@marp-team/marp-core/lib/browser.js) for browser context. It is useful when you cannot use bundler for the browser, like [@marp-team/marp-cli](https://github.com/marp-team/marp-cli).

Loading `lib/browser.js` will bring the almost same result as running `Marp.ready()`. Thus, you could use it through CDN as below:

```html
<html>
<body>
  <!-- Please insert here rendered HTML by `Marp.render().html`... -->
  <script defer src="https://cdn.jsdelivr.net/npm/@marp-team/marp-core/lib/browser.js"></script>
</body>
</html>
```

## Features

_We will only explain features extended in marp-core._ Please refer to [@marp-team/marpit](https://github.com/marp-team/marpit) repository if you want to know the basic feature of Marpit framework.

### Marp Markdown

Marp Markdown is based on [Marpit](https://github.com/marp-team/marpit) and [CommonMark](https://commonmark.org/), and there are these additional features:

- **Marpit**
  - Enable [inline SVG mode](https://github.com/marp-team/marpit#inline-svg-slide-experimental) and lazy YAML parsing by default.
- **CommonMark**
  - For security reason, HTML tag only allows whitelisted elements by default.
  - [Support table syntax based on GitHub Flavored Markdown.](https://help.github.com/articles/organizing-information-with-tables/)
  - Line breaks in paragraph will convert to `<br>` tag.
  - Auto convert URL like text into hyperlink.

### Emoji support

Emoji shortcode (like `:smile:`) and Unicode emoji 😄 will convert into the SVG vector image provided by [twemoji](https://github.com/twitter/twemoji) <img src="https://twemoji.maxcdn.com/2/svg/1f604.svg" alt="😄" width="16" height="16" />. It could render emoji with high resolution.

### Math typesetting

We have [Pandoc's Markdown style](https://pandoc.org/MANUAL.html#math) math typesetting support by [KaTeX](https://khan.github.io/KaTeX/). Surround your formula by `$...$` to render math as inline, and `$$...$$` to render as block.

<table>
<thead>
<tr>
<th style="text-align:center;width:50%;">Markdown</th>
<th style="text-align:center;width:50%;">Rendered slide</th>
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

![Math typesetting support](https://user-images.githubusercontent.com/3993388/44745975-26177f00-ab44-11e8-9951-ebf8031ab009.png)

</td>
</tbody>
</table>

### Auto scaling features

Auto scaling is available only if enabled [Marpit's `inlineSVG` mode](https://github.com/marp-team/marpit#inline-svg-slide-experimental). You have to run [`Marp.ready()`](#marpready) on browser context.

#### Fitting header

When the headings contains `<!-- fit -->` comment, the size of headings will resize to fit onto the slide size.

```markdown
# <!-- fit --> Fitting header
```

This syntax is similar to [Deckset's `[fit]` keyword](https://docs.decksetapp.com/English.lproj/Formatting/01-headings.html), but we use HTML comment to hide a fit keyword on Markdown rendered as document.

#### Code block

In several themes, we will shrink the viewing size of the code block to fit automatically if it is bigger than slide size. It means that the code on exported PDF is not cropped and not shown an unnecessary scrollbar.

|              Traditional rendering               |              Auto scaling               |
| :----------------------------------------------: | :-------------------------------------: |
| ![Traditional rendering](https://bit.ly/2LyEnmi) | ![Auto scaling](https://bit.ly/2N4yWQZ) |

This feature is available on `default` and `gaia` theme. `uncover` theme has disabled this feature because we use elastic style that has not compatible with auto scaling.

> :warning: We won't detect whether the code block actually protrudes from the slide.

## Constructor options

You can customize a behavior of Marp parser by passing an options object to the constructor. You can also pass together with [Marpit constructor options](https://marpit-api.marp.app/marpit#Marpit).

> :information_source: [Marpit's `markdown` option](https://github.com/marp-team/marpit/blob/6cec8177b1c296c6df4ec8c917e7c780940ad3bf/src/marpit.js#L58-L59) is accepted only object options because of always using CommonMark.

```javascript
const marp = new Marp({
  // marp-core constructor options
  html: true,
  emoji: {
    shortcode: true,
    unicode: false,
    twemojiBase: '/resources/twemoji/',
  },
  math: {
    katexFontPath: '/resources/fonts/',
  },

  // It can be included Marpit constructor options
  lazyYAML: false,
  markdown: {
    breaks: false,
  },
})
```

### `html`: _`boolean`_ | _`object`_

Setting whether to render raw HTML in Markdown.

- `true`: The all HTML will be allowed.
- `false`: All HTML except supported in Marpit Markdown will be disallowed.
- By passing `object`, you can set the whitelist to specify allowed tags and attributes.

```javascript
// Specify tag name as key, and attributes to allow as string array.
{
  a: ['href', 'target'],
  br: [],
}
```

Marp core allows only `<br>` tag by default, that is defined in [`Marp.html`](https://github.com/marp-team/marp-core/blob/3e854d0a50d4b1f36d01196169ab79ae171dbce1/src/marp.ts#L32-L34).

Whatever any option is selected, `<!-- HTML comment -->` is always parsed by Marpit for directives. When you are not disabled [Marpit's `inlineStyle` option](https://marpit-api.marp.app/marpit#Marpit) by `false`, `<style>` tags are parsed too for tweaking theme style.

> :information_source: `html` flag in `markdown` option cannot use because of overridden by this.

### `emoji`: _`object`_

Setting about emoji conversions.

- **`shortcode`**: _`boolean` | `"twemoji"`_

  - By setting `false`, it does not convert any emoji shortcodes.
  - By setting `true`, it converts emoji shortcodes into Unicode emoji. `:dog:` → 🐶
  - By setting `"twemoji"` string, it converts into twemoji vector image. `:dog:` → <img src="https://twemoji.maxcdn.com/2/svg/1f436.svg" alt="🐶" width="16" height="16" valign="middle" /> _(default)_

- **`unicode`**: _`boolean` | `"twemoji"`_

  - It can convert Unicode emoji into twemoji when setting `"twemoji"`. 🐶 → <img src="https://twemoji.maxcdn.com/2/svg/1f436.svg" alt="🐶" width="16" height="16" valign="middle" /> _(default)_
  - If you not want this aggressive conversion, please set `false`.

- **`twemojiBase`**: _`string`_

  - It is corresponded to [twemoji's `base` option](https://github.com/twitter/twemoji#object-as-parameter). By default, marp-core will use online emoji images [through MaxCDN (twemoji's default)](https://github.com/twitter/twemoji#cdn-support).

> **For developers:** When you setting `unicode` option as `true`, Markdown parser will convert Unicode emoji into tokens internally. The rendering result is same as in `false`.

### `math`: _`boolean` | `object`_

Enable or disable [math typesetting](#math-typesetting) syntax. The default value is `true`.

You can modify KaTeX further settings by passing an object of sub-options.

- **`katexOption`**: _`object`_

  - The options passing to KaTeX. Please refer to [KaTeX document](https://khan.github.io/KaTeX/docs/options.html).

- **`katexFontPath`**: _`string` | `false`_

  - By default, marp-core will use [online web-font resources through jsDelivr CDN](https://cdn.jsdelivr.net/npm/katex@latest/dist/fonts/). You have to set path to fonts directory if you want to use local resources. If you set `false`, we will not manipulate the path (Use KaTeX's original path: `fonts/KaTeX_***-***.woff2`).

<!-- ## [Work in progress] Themes -->

## Author

Managed by [@marp-team](https://github.com/marp-team).

- <img src="https://github.com/yhatt.png" width="16" height="16"/> Yuki Hattori ([@yhatt](https://github.com/yhatt))

## License

[MIT License](LICENSE)
