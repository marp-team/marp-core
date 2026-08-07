# Theme authoring

This guide covers Marp Core specific theme authoring.

- **[Color definitions](#color-definitions)**
- **[Feature metadata](#feature-metadata)**

> [!NOTE]
>
> This guide covers only Marp Core extensions. See [the Marpit documentation](https://marpit.marp.app/theme-css) for the basic of theme CSS.

---

# Color definitions

Colors related to [Marp Core specific features](./markdown.md) are normally managed using [CSS variables](https://developer.mozilla.org/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties). Theme authors and Markdown authors can use [the `section`](https://marpit.marp.app/theme-css?id=create-theme-css) or [`:root` selector](https://marpit.marp.app/theme-css?id=root-pseudo-class-selector) to define and [customize](https://marpit.marp.app/theme-css?id=tweak-style-through-markdown) colors.

Please also refer to the [built-in theme sources](../themes/) for how to define colors and apply them to elements.

## [Syntax highlighting](./markdown.md#syntax-highlighting)

| Variable                      | Description                           |
| ----------------------------- | ------------------------------------- |
| `--marp-shiki-foreground`     | A default foreground color            |
| `--marp-shiki-background`     | A default background color            |
| `--marp-shiki-line-highlight` | A color for [highlighting lines]      |
| `--marp-shiki-token-*`        | [Colors for syntax tokens...][tokens] |

[highlighting lines]: ./markdown.md#line-highlighting
[tokens]: https://shiki.style/guide/theme-colors#css-variables-theme

## [Mermaid diagrams](./markdown.md#mermaid-diagrams)

| Variable                    | Description                | Fallback                     |
| --------------------------- | -------------------------- | ---------------------------- |
| `--marp-mermaid-background` | A default background color | `--marp-shiki-background`    |
| `--marp-mermaid-foreground` | A default foreground color | `--marp-shiki-foreground`    |
| `--marp-mermaid-accent`     | An accent color            | `--marp-shiki-token-keyword` |
| `--marp-mermaid-muted`      | A muted color              | `--marp-shiki-token-comment` |
| `--marp-mermaid-surface`    | A surface color            | `--marp-shiki-background`    |
| `--marp-mermaid-line`       | A line color               | -                            |
| `--marp-mermaid-border`     | A border color             | -                            |

If the theme already defines syntax highlighting colors, most of the mermaid diagram colors automatically fall back to them. It's enough to define only colors for highlighting, and set `--marp-mermaid-*` if necessary.

---

# Feature metadata

In Marp Core, a theme can declare which core-specific features it supports by defining additional [metadata](https://marpit.marp.app/theme-css?id=metadata).

- [**`@auto-scaling`**](#auto-scaling): Enables [auto-scaling features](./markdown.md#auto-scaling).
- [**`@size`**](#slide-size-presets): Defines [slide size presets](./markdown.md#slide-size).

Features enabled by additional metadata may output an HTML DOM that differs from the standard Marpit structure. This is why themes are able to control these. A theme without Marp Core metadata continues to work as a standard Marpit theme.

### Example

[Marpit's `@theme` metadata](https://marpit.marp.app/theme-css?id=metadata) is **still required** alongside the Marp Core metadata.

```css
/*
 * @theme example
 * @auto-scaling true
 * @size 16:9 1280px 720px
 * @size 4:3 960px 720px
 */
```

## Auto-scaling

The **`@auto-scaling`** metadata configures which [auto-scaling features](./markdown.md#auto-scaling) to enable for this theme.

- **`false`** (default): Disables all auto-scaling features.
- **`true`**: Enables all auto-scaling features.

* **Comma-separated list of flags**: Enables only the specified features:
  - `fittingHeader`: [The fitting header (`<!-- fit -->`)](./markdown.md#fitting-header)
  - `code`: Auto-shrinking of code blocks
  - `math`: Auto-shrinking of [KaTeX math blocks](./markdown.md#math-typesetting) (NOTE: MathJax blocks always down-scale)

```css
/*
* @theme example
* @auto-scaling code,math
*/
```

### Styling

Whether enabling auto-scaling features or not, styling of the affected elements, `h1`-`h6`, `pre`, and `.katex-display` is working as usual (Marp Core automatically transforms style definitions for them).

If enabled auto-scaling, the theme can style the wrapper block with the `::part(auto-scaling)` pseudo-element.

```css
h1::part(auto-scaling),
h2::part(auto-scaling),
h3::part(auto-scaling),
h4::part(auto-scaling),
h5::part(auto-scaling),
h6::part(auto-scaling) {
  /* ... */
}

pre::part(auto-scaling) {
  /* ... */
}

.katex-display::part(auto-scaling) {
  /* ... */
}
```

These are especially useful for setting a maximum height of the auto-scaling elements through [`max-height`](https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/max-height). Please also refer to the [built-in theme sources](../themes/) for examples of auto-scaling styling.

## Slide size presets

Each **`@size`** metadata entry makes a named preset available to the Markdown [`size` global directive](./markdown.md#slide-size).

```css
/*
 * @theme example
 * @size 4:3 960px 720px
 * @size 16:9 1280px 720px
 * @size 4K 3840px 2160px
 */

section {
  /* The regular Marpit dimensions remain the default. */
  width: 1280px;
  height: 720px;
}
```

The syntax is `@size <name> <width> <height>`. The Markdown author can select a defined preset with name:

```markdown
<!-- size: 4K -->
```

### Styling

Marp Core normally adds a `data-size` attribute to the rendered `<section>`, allowing a theme to adjust styles for a selected preset:

```css
section[data-size='4:3'] {
  font-size: 28px;
}
```

### Inheritance of size presets

When [the theme has imported another theme](https://marpit.marp.app/theme-css?id=import-rule), size presets defined by the imported theme are also available. You also can override inherited presets by defining a new preset with the same name.

If you want to disable a specific inherited preset, `@size <name> false` can be used:

```css
@import 'default';

/**
 * Based on the default theme, but disables the 4:3 preset (only 16:9)
 *
 * @theme default-16-9
 * @size 4:3 false
 */
```
