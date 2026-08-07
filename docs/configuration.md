# Configuration

This guide is for developers integrating Marp Core into an application.

- ⚙️ [**Constructor options**](#constructor-options)
- 🧩 [**Core plugin configurations**](#core-plugin-configurations)
- 🌐 [**Browser helper**](#browser-helper)

---

# Constructor options

You can configure the behavior of Marp Core by passing constructor options to the `Marp` class. It allows both [Marpit's constructor options](https://marpit-api.marp.app/marpit#Marpit) and Marp Core-specific options.

```javascript
import { Marp } from '@marp-team/marp-core'

const marp = new Marp({
  html: true,
  emoji: {
    shortcode: true,
    unicode: false,
  },
  math: 'katex',
  minifyCSS: true,
  script: {
    source: 'cdn',
    nonce: 'xxxxxxxxxxxxxxx',
  },
  slug: false,

  // Marpit options are also accepted:
  anchor: false,
  looseYAML: false,
  markdown: {
    breaks: false,
  },
})
```

## Marpit options

Following [Marpit options](https://marpit-api.marp.app/marpit#Marpit) are changed from Marpit's defaults:

- **`cssContainerQuery`**: `false` → `true` (Enable container queries)
- **`inlineSVG`**: `false` → `true` (Enable [inline SVG slide](https://marpit.marp.app/inline-svg))
- **`looseYAML`**: `false` → `true` (Enable loose YAML front-matter parsing)

* **`markdown`**: [markdown-it options](https://markdown-it.github.io/markdown-it/interfaces/MarkdownItOptions.html) based on CommonMark preset
  - **`breaks`**: `false` → `true` (Enable hardbreaks in Markdown)
  - **`highlight`**: `undefined` → Use Marp Core's syntax highlighter and diagram renderers
  - **`linkify`**: `false` → `true` (Enable automatic link detection in Markdown)

Developers can override these defaults and other Marpit options by passing their own values to the `Marp` constructor.

## `html`

Controls raw HTML in Markdown. It is similar to markdown-it's [`html` option](https://markdown-it.github.io/markdown-it/interfaces/MarkdownItOptions.html#property.html), but supports an element and attribute allowlist.

- _**Default**_: Allow [known-safe HTML elements and attributes](../src/html/allowlist.ts).
- **`true`**: ⚠️ Allow all raw HTML, including insecure elements and attributes.
- **`false`**: Disallow raw HTML (except structures required by Marpit Markdown).
- **Object**: Use a custom allowlist.

### Custom allowlist

Define allowed elements, and attributes as an array:

```javascript
const marp = new Marp({
  html: {
    a: ['href', 'target'],
    br: [],
  },
})
```

For attributes, you can also define a filter function:

```javascript
const marp = new Marp({
  html: {
    img: {
      src: (value) => (value.startsWith('https://') ? value : ''),
    },
  },
})
```

> [!NOTE]
>
> HTML comments and `<style>` elements required by [Marpit directives](https://marpit.marp.app/directives) and [style tweaks](https://marpit.marp.app/theme-css?id=tweak-style-through-markdown) are parsed regardless of this option.

## `emoji`

Pass an object for controlling [emoji conversion](./markdown.md#emoji).

```javascript
const marp = new Marp({
  emoji: {
    shortcode: 'twemoji',
    unicode: false,
    twemoji: {
      base: '/resources/twemoji/',
      ext: 'svg',
    },
  },
})
```

### `shortcode`

Setting for shortcode emoji conversion like `:smile:`:

- **`"twemoji"`** _(default)_: Convert shortcode emoji to Twemoji image.
- **`true`**: Convert shortcode emoji to Unicode emoji.
- **`false`**: Disable shortcode emoji conversion.

### `unicode`

Setting for Unicode emoji conversion like `😄`:

- **`"twemoji"`** _(default)_: Convert Unicode emoji to Twemoji image.
- **`true`**: Unicode emojis are converted into internal tokens, _but remain visually unchanged as Unicode._
- **`false`**: Unicode emojis are preserved as is.

### `twemoji`

Options for [Twemoji](https://github.com/jdecked/twemoji#object-as-parameter).

#### `base`

Set base URL as string. Corresponds to [twemoji's `base` option](https://github.com/jdecked/twemoji#object-as-parameter).

By default, Marp Core will use [online emoji images through jsDelivr CDN](https://cdn.jsdelivr.net/gh/jdecked/twemoji/assets/svg/).

#### `ext`

The filetype of Twemoji images.

- **`"svg"`** _(default)_: Use SVG emoji images.
- **`"png"`**: Use PNG emoji images.

## `math`

> **Prerequisite**: The corresponding math plugin `@marp-team/marp-core/plugins/mathjax` or `@marp-team/marp-core/plugins/katex` must be registered through `use()`.

Controls the preferred math library in [math typesetting](./markdown.md#math-typesetting).

- **`true`** _(default)_: Prefer the first registered math plugin.
- **`"mathjax"`**: Prefer MathJax first (provided by `@marp-team/marp-core/plugins/mathjax`).
- **`"katex"`**: Prefer KaTeX first (provided by `@marp-team/marp-core/plugins/katex`).
- `false`: Disable math typesetting and [`math` global directive](./markdown.md#choose-a-math-library).

<!-- v5 still supports { lib: "mathjax" } or { lib: "katex" }, but it's legacy so not documented. -->

> [!NOTE]
>
> - The full build `@marp-team/marp-core/full` registers MathJax plugin first, and therefore prefers it by default.
> - When enabled math typesetting, [`math` global directive in Markdown](./markdown.md#choose-a-math-library) always takes priority over this setting.
> - If a preferred math library is not registered, the first available library will be used as fallback.
> - The KaTeX plugin has additional configuration options. See [KaTeX plugin configuration](#katex) for details.

## `minifyCSS`

Controls CSS minification in the result of `render()`.

- **`true`** _(default)_: Minify CSS in the result of `render()`.
- **`false`**: Do not minify CSS.

## `script`

Controls [the browser helper `@marp-team/marp-core/browser`](#browser-helper) script injection.

- **`true`** _(default)_: Inject the browser helper at the end of slides through `<script>`.
- **`false`**: Do not inject it; the application must call the [browser helper](#browser-helper) manually.
- **Object**: Inject the browser helper, with additional configuration:

### `source`

- **`"inline"`** _(default)_: Embed the inline script in the rendered HTML. It works with offline environments.
- **`"cdn"`**: Load the script from [jsDelivr CDN](https://www.jsdelivr.com/package/npm/@marp-team/marp-core/). It's better if [CSP blocks unsafe inline scripts](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src#unsafe_inline_script).

### `nonce`

You can set a string for `nonce` attribute to the `<script>` tag.

```javascript
const marp = new Marp({
  script: {
    source: 'cdn',
    nonce: 'xxxxxxxxxxxxxxx',
  },
})
```

## `slug`

Controls generated `id` attributes on `<h1>` through `<h6>` headings.

- **`true`** _(default)_: Generate GitHub-like slugs and suffix duplicates.
- **`false`**: Do not generate heading IDs.
- **Function**: Use a custom [slugifier](#slugifier) function.
- **Object**: Use custom slugifier and duplicate suffixing.

### `slugifier`

`(text: string) => slug: string`

Set a function to generate a slug from heading text.

- `text`: Heading text without Markdown formatting.
- `slug`: Generated slug.

### `postSlugify`

`(slug: string, index: number) => id: string`

Set a function to modify the final ID, from the generated slug and its duplicate index. By default, duplicate slug `xxx` becomes `xxx-1`, `xxx-2`, and so on.

- `slug`: Originally generated slug.
- `index`: Zero-based index of the duplicate slug.
- `id`: Final ID to be set on the heading.

```javascript
const marp = new Marp({
  slug: {
    slugifier: (text) => text.toLowerCase().replaceAll(' ', '_'),
    postSlugify: (slug, index) => (index > 0 ? `${slug}_${index}` : slug),
  },
})
```

> [!NOTE]
>
> Take care not to confuse Marp Core's `slug` option and [Marpit's `anchor` option](https://marpit-api.marp.app/marpit/#constructor:~:text=opts.-,anchor,-%28boolean%20%7C%20Marpit). `slug` is for the Markdown headings, and `anchor` is for the slide page elements.

> [!TIP]
>
> To fully disable auto-generated `id` attribute from slides, set both of `slug` and `anchor` as `false`. _It's important to avoid breaking your Web application by the collision of same `id` values in the same document._

---

# Core plugin configurations

[Core plugins](../README.md#core-plugins) are optional Marp Core plugins for several features. In some plugins, the developer can configure the behavior of the plugin.

## Shiki

An instance of `Marp` class has `shikiTransformers` member, which is an array of [Shiki transformers](https://shiki.style/guide/transformers). For more advanced usage, you can push custom transformers to the array to customize the output of syntax highlighting.

### Example

```javascript
import { Marp } from '@marp-team/marp-core'
import shikiPlugin from '@marp-team/marp-core/plugins/shiki'
import { transformerNotationHighlight } from '@shikijs/transformers'

const marp = new Marp().use(shikiPlugin())
marp.shikiTransformers.push(transformerNotationHighlight())
```

In this instance, [`transformerNotationHighlight()` from `@shikijs/transformers`](https://shiki.style/packages/transformers#transformernotationhighlight) allows [line highlighting](./markdown.md#line-highlighting) through Shiki's specific notation:

````markdown
```ts
const marp = new Marp().use(shikiPlugin())
marp.shikiTransformers.push(transformerNotationHighlight()) // [!code highlight]
```
````

It means the same as:

````markdown
```ts {2}
const marp = new Marp().use(shikiPlugin())
marp.shikiTransformers.push(transformerNotationHighlight())
```
````

## KaTeX

`katexPlugin()` accepts custom options and a font path:

```javascript
import { Marp } from '@marp-team/marp-core'
import katexPlugin from '@marp-team/marp-core/plugins/katex'

const marp = new Marp().use(
  katexPlugin({
    options: { leqno: true, fleqn: true },
    fontPath: '/assets/katex-fonts/',
  }),
)
```

### `options`

Custom options for KaTeX. Please refer to [KaTeX's options](https://katex.org/docs/options.html) for details.

### `fontPath`

Set a path to [KaTeX font files](https://katex.org/docs/font). It is used in the `@font-face` rule of the KaTeX CSS.

- _**Default**_: Use KaTeX fonts through [jsDelivr CDN](https://cdn.jsdelivr.net/npm/katex/dist/fonts/).
- **String**: Use a custom path to KaTeX font files, like `url({fontPath}KaTeX_*.woff2)`.
- **`false`**: Use original path in the KaTeX CSS, like `url(fonts/KaTeX_*.woff2)`.

> [!NOTE]
>
> - You cannot pass options to the KaTeX plugin registered by a full build `@marp-team/marp-core/full`.
> - `katexOption` and `katexFontPath` options in [the `math` option of the `Marp` constructor](#math), which were available up to v4, have been deprecated in favor of the plugin configuration.

---

# Browser helper

The browser helper is exported separately from **`@marp-team/marp-core/browser`**. It's required for following purposes:

- **Polyfill**: Apply [`@marp-team/marpit-svg-polyfill`](https://github.com/marp-team/marpit-svg-polyfill) to support correct rendering of inline SVG slides for Safari.
- **[Auto-scaling](./markdown.md#auto-scaling)**: The browser helper replaces elements marked as scalable by auto-scaling features into the custom element provided by Marp Core.

By default, Marp Core injects the browser helper script at the end of slides through a `<script>` tag. However, this injection may be blocked or even prohibited for security reasons.

If so, you can disable the script injection by setting [the `script` option](#script) of the `Marp` constructor as `false`. In this case, you must call the browser helper manually after rendering slides in the browser.

## Usage

```javascript
// Server-side conversion
import { Marp } from '@marp-team/marp-core'

const marp = new Marp({ script: false })
const rendered = marp.render('# <!-- fit --> Hello!')
```

```javascript
// Browser-side rendering and script execution
import { browser } from '@marp-team/marp-core/browser'

document.body.innerHTML = `<style>${rendered.css}</style>${rendered.html}`
browser()
```

## Specify a target element

`browser()` observes the whole `document` by default. If you want to limit the observation target, you can pass a specific element as an argument.

```javascript
const element = document.getElementById('marp-slide-container')
browser(element)
```

### Examples

The most helpful use cases are `<iframe>` and [shadow DOM](https://developer.mozilla.org/docs/Web/API/Web_components/Using_shadow_DOM). Both approaches can isolate the rendered slides and styles from the parent document, but `browser()` cannot observe inside them. Thus, you must pass the inner element to `browser()`.

```javascript
const iframeElm = document.querySelector('iframe#marp-iframe-elm')
iframeElm.contentDocument.body.innerHTML = `<style>${rendered.css}</style>${rendered.html}`

browser(iframeElm.contentDocument.body)
```

<details>
<summary>Usage in Shadow DOM</summary>

```javascript
// Shadow DOM
const shadowElm = document.getElementById('marp-shadow-elm')
const shadowRoot = shadowElm.attachShadow({ mode: 'open' })

shadowRoot.innerHTML = `<style>${rendered.css}</style>${rendered.html}`
browser(shadowRoot)
```

> Shadow DOM looks like an ideal way to isolate Marp rendering from the document, but actually Chromium cannot load and apply Web Fonts within a Shadow DOM, which can result in incorrect rendering (https://crbug.com/41085401).

</details>

## Update and cleanup

`browser()` returns a cleanup function with `update()` and `cleanup()` methods.

```javascript
element.innerHTML = renderSlide()
const browserHelper = browser(element)

// Call update() after replacing the rendered DOM under the same target
element.innerHTML = renderAnotherSlide()
browserHelper.update()

// Call cleanup() when the target is no longer used
browserHelper.cleanup() // browserHelper() is also equivalent to this
```

It's helpful for building a Marp component that re-renders the slides in the same element.

### Examples

<details>
<summary>React/Next.js example</summary>

```javascript
// next.config.mjs
export default {
  serverExternalPackages: ['@marp-team/marp-core'],
}
```

```jsx
import 'server-only'
import { Marp } from '@marp-team/marp-core/full'
import { MarpSlideClient } from './MarpSlideClient'

const marp = new Marp({
  script: false,
  container: false, // Disable CSS scoping to Marpit container element
})

export const MarpSlide = ({ markdown, page = 1 }) => {
  const rendered = marp.render(markdown, { htmlAsArray: true })
  const renderPage = Math.min(Math.max(page - 1, 0), rendered.html.length - 1)

  return <MarpSlideClient html={rendered.html[renderPage]} css={rendered.css} />
}
```

```javascript
'use client'

import { useEffect, useRef } from 'react'
import { browser } from '@marp-team/marp-core/browser'

export const MarpSlideClient = ({ html, css }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    ref.current.contentDocument.head.innerHTML = '<base target="_parent"/>'

    const root = ref.current.contentDocument.body
    root.style.margin = '0'
    root.innerHTML = `<style>${css}</style>${html}`

    const browserHelper = browser(root)
    return () => browserHelper.cleanup()
  }, [html, css])

  return <iframe ref={ref} title="Marp Slide" />
}
```

</details>
