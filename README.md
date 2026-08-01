# @marp-team/marp-core

[![CircleCI](https://img.shields.io/circleci/project/github/marp-team/marp-core/main.svg?style=flat-square&logo=circleci)](https://circleci.com/gh/marp-team/marp-core/)
[![Codecov](https://img.shields.io/codecov/c/github/marp-team/marp-core/main.svg?style=flat-square&logo=codecov)](https://codecov.io/gh/marp-team/marp-core)
[![npm](https://img.shields.io/npm/v/@marp-team/marp-core.svg?style=flat-square&logo=npm)](https://www.npmjs.com/package/@marp-team/marp-core)
[![LICENSE](https://img.shields.io/github/license/marp-team/marp-core.svg?style=flat-square)](./LICENSE)

**The core of the [Marp] converter.**

Marp Core extends the [Marpit] framework with practical Markdown syntax, advanced features, official themes, and optional core plugins.

[marp]: https://marp.app
[marpit]: https://marpit.marp.app

## Install

Marp Core supports Node.js 20.19 or later, but we highly recommend using an [actively supported Node.js version](https://nodejs.org/en/about/releases/).

```bash
npm install --save @marp-team/marp-core
```

## Entrypoints

Since v5, Marp Core has been split into a lightweight core and [optional core plugins](#core-plugins).

| Entrypoint                      | Description                                                                             | Bundled size\* |
| ------------------------------- | --------------------------------------------------------------------------------------- | -------------- |
| **`@marp-team/marp-core`**      | Lightweight core with Marp's essential features                                         | 0.5MB          |
| **`@marp-team/marp-core/full`** | Full build with all core plugins<br />_(requires installing all optional dependencies)_ | 11.4MB         |

###### \*: Rough estimates for a minified browser ESM build before gzip. The full entrypoint includes all optional dependencies.

The full build provides a consistent experience across the Marp toolchain. For your own application, we recommend the lightweight core with only the plugins you need.

About the `@marp-team/marp-core/browser` entrypoint, see the [browser helper](./docs/configuration.md#browser-helper).

## Core plugins

Marp Core also provides optional plugins for several core features. These often require additional dependencies along with Marp Core.

| Plugin                                     | Feature                                            | Optional dependency                                                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@marp-team/marp-core/plugins/shiki`**   | Syntax highlighting powered by [Shiki]             | `shiki`                                                                                                                                                                                     |
| **`@marp-team/marp-core/plugins/mermaid`** | [Mermaid] rendering powered by [beautiful-mermaid] | `beautiful-mermaid`                                                                                                                                                                         |
| **`@marp-team/marp-core/plugins/katex`**   | Math typesetting powered by [KaTeX]                | `katex`                                                                                                                                                                                     |
| **`@marp-team/marp-core/plugins/mathjax`** | Math typesetting powered by [MathJax]              | `@mathjax/src`<br>`@mathjax/mathjax-bbm-font-extension`<br>`@mathjax/mathjax-bboldx-font-extension`<br>`@mathjax/mathjax-dsfont-font-extension`<br>`@mathjax/mathjax-mhchem-font-extension` |

[beautiful-mermaid]: https://github.com/lukilabs/beautiful-mermaid
[katex]: https://khan.github.io/KaTeX/
[mathjax]: https://www.mathjax.org/
[mermaid]: https://github.com/mermaid-js/mermaid
[shiki]: https://shiki.style/

To use `@marp-team/marp-core/full`, install every optional dependency along with Marp Core:

```bash
npm install --save \
  @marp-team/marp-core \
  shiki \
  beautiful-mermaid \
  katex \
  @mathjax/src \
  @mathjax/mathjax-bbm-font-extension \
  @mathjax/mathjax-bboldx-font-extension \
  @mathjax/mathjax-dsfont-font-extension \
  @mathjax/mathjax-mhchem-font-extension
```

## Usage

Marp Core provides the **`Marp`** class, inherited from [Marpit], so its basic usage is the same as Marpit.

```javascript
import { Marp } from '@marp-team/marp-core'

const marp = new Marp()
const { html, css } = marp.render('# Hello, marp-core!')
```

Use `@marp-team/marp-core/full` instead when you want the full build.

See the [Marpit usage documentation](https://marpit.marp.app/usage) for more details.

### With plugins

Add optional core plugins selectively by chaining [`use()`](https://marpit.marp.app/usage?id=extend-by-plugins).

```javascript
import { Marp } from '@marp-team/marp-core'
import katexPlugin from '@marp-team/marp-core/plugins/katex'
import shikiPlugin from '@marp-team/marp-core/plugins/shiki'

const marp = new Marp().use(shikiPlugin()).use(katexPlugin())
```

You can also add any Marpit-compatible plugin.

## Documentation

Choose the guide that matches what you want to do:

- **[Markdown features](./docs/markdown.md)** - Write slides with Marp Markdown
- **[Built-in themes](./themes/)** - All about the official themes
- **[Theme authoring](./docs/theme-authoring.md)** - Create a custom theme suitable for Marp
- **[Configuration](./docs/configuration.md)** - Integrate Marp Core into your project

## Contributing

Interested in contributing? See [CONTRIBUTING.md](.github/CONTRIBUTING.md) and [the common contribution guidelines for the Marp team](https://github.com/marp-team/.github/blob/master/CONTRIBUTING.md).

## Author

Managed by [@marp-team](https://github.com/marp-team).

- <img src="https://github.com/yhatt.png" width="16" height="16" alt="" /> Yuki Hattori ([@yhatt](https://github.com/yhatt))

## License

This package is released under the [MIT License](LICENSE).
