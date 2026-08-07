# Migration from v4 to v5

This document describes the breaking changes introduced in Marp Core v5 and how to migrate your code from v4 to v5.

## TL;DR

### For Markdown and theme authors

- **[highlight.js → Shiki](#highlightjs--shiki)**: Please review `.hljs-*` classes in your style for syntax highlighting, and replace them with `--marp-shiki-*` CSS variables definition. See [Color definitions](./theme-authoring.md#color-definitions) for more information.

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

2. Replace `@marp-team/marp-core` import with `@marp-team/marp-core/full` in your code:

   ```diff
   - import { Marp } from '@marp-team/marp-core'
   + import { Marp } from '@marp-team/marp-core/full'
   ```

This is the most frictionless way to migrate to v5. If you want to granularly control which features to include, please continue reading.

## Node.js 20.19 or later is required

Marp Core v5 supports Node.js 20.19 or later.

Please note that **Node.js 20 is no longer in active support.** For updating, we highly recommend using Node.js LTS or current version. Check out the [Node.js release schedule](https://nodejs.org/en/about/releases/) for more information.

## `@marp-team/marp-core` is now a lightweight core

Marp Core has included all features to be used in the Marp ecosystem toolchain. However, with the expansion of features, there is a concern about extreme bloat in bundle size.

<!-- Using [Marpit, a skinny framework](https://marpit.marp.app/), can be a solution to the size problem, but it's intended for developers of their own slide engines. For the Marp experience, using Marp Core is preferable. -->

So v5 split the Marp Core into **a lightweight core and optional core plugins**. `@marp-team/marp-core` provides only the essential features, and developers can pick and choose optional plugins for the feature as needed.

```javascript
import { Marp } from '@marp-team/marp-core'
import katexPlugin from '@marp-team/marp-core/plugins/katex'
import mermaidPlugin from '@marp-team/marp-core/plugins/mermaid'

const marp = new Marp().use(katexPlugin()).use(mermaidPlugin())
```

### `@marp-team/marp-core/full` entrypoint

A new entrypoint `@marp-team/marp-core/full` includes all core plugin features. It is recommended to use it for developers who want to provide a consistent experience across the Marp ecosystem toolchain.

For the migration, using `@marp-team/marp-core/full` is the closest migration path to the v4 feature set.

```diff
- import { Marp } from '@marp-team/marp-core'
+ import { Marp } from '@marp-team/marp-core/full'
```

## External libraries are now optional

By separating core plugins, Marp Core v5 no longer includes external libraries for each feature. Developers can now control which external libraries to include in their project.

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

For using the full entrypoint `@marp-team/marp-core/full`, you need to install all optional dependencies.

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

Shiki is a syntax highlighter that uses TextMate grammars, which are used in VS Code. It provides more accurate syntax highlighting and language support, compliant with the latest IDEs.

Marp also provides [color definitions for syntax highlighting based on CSS variables](./theme-authoring.md#color-definitions).
The styling for highlight.js through `.hljs-*` could apply flexible style customization by CSS, but it was difficult to control in complex cases (custom color scheme class, inherited theme, and so on: [marp-team/marp#103](https://github.com/orgs/marp-team/discussions/103)). The new color definitions become simplified to a dozen of CSS variables and are easily controllable.

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

For Markdown and theme authors, please review your style for syntax highlighting and replace `.hljs-*` classes with `--marp-shiki-*` CSS variables definition. Check out [Color definitions](./theme-authoring.md#color-definitions) for more information.

> [!NOTE]
>
> The `highlightjs` getter also has been removed from the `Marp` class. To customize the output of syntax highlighting in v5, you can use a new [`shikiTransformers`](./configuration.md#shiki) member.
