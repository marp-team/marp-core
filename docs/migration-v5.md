# Migration from v4 to v5

This document describes the breaking changes introduced in Marp Core v5 and how to migrate your code from v4 to v5.

## TL;DR

### For Markdown and theme authors

- **[highlight.js → Shiki](#highlightjs--shiki)**: Please review `.hljs-*` classes in your style for syntax highlighting, and replace them with `--marp-shiki-*` CSS variable definitions. See [Color definitions](./theme-authoring.md#color-definitions) for more information.

  ```diff
  -.hljs {
  -  color: #333;
  -  background-color: #eee;
  -}
  -.hljs-string { color: #008000; }
  -.hljs-comment { color: #808080; }
  -.hljs-keyword { color: #0000ff; }

  +section {
  +  --marp-shiki-foreground: #333;
  +  --marp-shiki-background: #eee;
  +  --marp-shiki-token-string: #008000;
  +  --marp-shiki-token-comment: #808080;
  +  --marp-shiki-token-keyword: #0000ff;
  +  /* ... */
  +}
  ```

### For developers

1. Install Marp Core v5 and all optional peer dependencies:

   ```
   npm install --save \
     @marp-team/marp-core@5 \
     shiki \
     beautiful-mermaid \
     katex \
     @mathjax/src \
     @mathjax/mathjax-bbm-font-extension \
     @mathjax/mathjax-bboldx-font-extension \
     @mathjax/mathjax-dsfont-font-extension \
     @mathjax/mathjax-mhchem-font-extension
   ```

2. Change imports from `@marp-team/marp-core` to `@marp-team/marp-core/full`:

   ```diff
   - import { Marp } from '@marp-team/marp-core'
   + import { Marp } from '@marp-team/marp-core/full'
   ```

This is the simplest way to migrate to v5. If you want fine-grained control over which features to include, please continue reading.

## Node.js 20.19 or later is required

Marp Core v5 supports Node.js 20.19 or later.

Please note that **Node.js 20 has already reached end-of-life.** We strongly recommend
upgrading to a currently supported LTS or Current release. Check out the [Node.js release schedule](https://nodejs.org/en/about/releases/) for more information.

## `@marp-team/marp-core` is now a lightweight core

Until v4, Marp Core bundled all of its features into a single entry point. As features were added, however, the bundle grew significantly.

<!-- Using [Marpit, a skinny framework](https://marpit.marp.app/), can be a solution to the size problem, but it's intended for developers of their own slide engines. For the Marp experience, using Marp Core is preferable. -->

Marp Core v5 therefore splits these features between **a lightweight core and optional core plugins**. The default `@marp-team/marp-core` entry point provides only essential features, allowing developers to install and enable only the plugins they need.

```javascript
import { Marp } from '@marp-team/marp-core'
import katexPlugin from '@marp-team/marp-core/plugins/katex'
import mermaidPlugin from '@marp-team/marp-core/plugins/mermaid'

const marp = new Marp().use(katexPlugin()).use(mermaidPlugin())
```

### `@marp-team/marp-core/full` entrypoint

A new entrypoint `@marp-team/marp-core/full` includes all core plugin features. We recommend it for developers who want to provide a consistent experience across the Marp ecosystem toolchain.

For migrations from v4, `@marp-team/marp-core/full` provides the closest equivalent to the v4 feature set.

```diff
- import { Marp } from '@marp-team/marp-core'
+ import { Marp } from '@marp-team/marp-core/full'
```

## External libraries are now optional

In v5, the external libraries required by core plugins are optional peer dependencies rather than direct dependencies of Marp Core. Developers can therefore install only the libraries required by the features they use.

| Plugin                                     | Optional dependency                                                                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@marp-team/marp-core/plugins/shiki`**   | `shiki`                                                                                                                                                                                     |
| **`@marp-team/marp-core/plugins/mermaid`** | `beautiful-mermaid`                                                                                                                                                                         |
| **`@marp-team/marp-core/plugins/katex`**   | `katex`                                                                                                                                                                                     |
| **`@marp-team/marp-core/plugins/mathjax`** | `@mathjax/src`<br>`@mathjax/mathjax-bbm-font-extension`<br>`@mathjax/mathjax-bboldx-font-extension`<br>`@mathjax/mathjax-dsfont-font-extension`<br>`@mathjax/mathjax-mhchem-font-extension` |

For example, if you want to use KaTeX math typesetting and Mermaid rendering, you can install only `katex` and `beautiful-mermaid` along with Marp Core:

```
npm install --save @marp-team/marp-core@5 katex beautiful-mermaid
```

To use the full entrypoint `@marp-team/marp-core/full`, you need to install all optional dependencies.

```
npm install --save \
  shiki \
  beautiful-mermaid \
  katex \
  @mathjax/src \
  @mathjax/mathjax-bbm-font-extension \
  @mathjax/mathjax-bboldx-font-extension \
  @mathjax/mathjax-dsfont-font-extension \
  @mathjax/mathjax-mhchem-font-extension
```

## highlight.js → Shiki

Marp Core v5 switched the syntax highlighter from [highlight.js](https://highlightjs.org/) to [Shiki](https://shiki.style/).

Shiki uses TextMate grammars for syntax highlighting, as does VS Code. It provides accurate highlighting and broad language support.

Marp also provides [color definitions for syntax highlighting based on CSS variables](./theme-authoring.md#color-definitions). Styling highlight.js through `.hljs-*` classes allowed flexible customization, but became difficult to manage in complex cases such as custom color-scheme classes and theme inheritance (see [marp-team/marp#103](https://github.com/orgs/marp-team/discussions/103)). The new approach consolidates color customization into about a dozen CSS variables, making it easier to manage.

```css
section {
  --marp-shiki-foreground: #333;
  --marp-shiki-background: #eee;
  --marp-shiki-line-highlight: #f88;
  --marp-shiki-token-constant: #660000;
  --marp-shiki-token-string: #770000;
  --marp-shiki-token-comment: #880000;
  --marp-shiki-token-keyword: #990000;
  --marp-shiki-token-parameter: #aa0000;
  --marp-shiki-token-function: #bb0000;
  --marp-shiki-token-string-expression: #cc0000;
  --marp-shiki-token-punctuation: #dd0000;
  --marp-shiki-token-link: #ee0000;
}
```

For Markdown and theme authors, please review your style for syntax highlighting and replace `.hljs-*` classes with `--marp-shiki-*` CSS variable definitions. Check out [Color definitions](./theme-authoring.md#color-definitions) for more information.

> [!NOTE]
>
> `Marp` instances no longer expose the `highlightjs` getter. To customize syntax-highlighting output in v5, use the new [`shikiTransformers`](./configuration.md#shiki) property.
