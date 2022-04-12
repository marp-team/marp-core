# Marp Core built-in themes

We provide some nice built-in themes in Marp Core. You can choose a favorite theme by using [Marpit `theme` directive](https://marpit.marp.app/directives?id=theme) in your Markdown.

<!-- Screenshots were taken from the rendered result of [an example][example]. -->

[example]: example.md

### Common feature

These can use in the all of built-in themes.

#### 4:3 slide

We have `4:3` slide size preset (`960x720`) for a traditional presentation.

```markdown
<!-- size: 4:3 -->
```

#### `invert` class

By using `invert` class, you can change to use the inverted color scheme.

```markdown
<!-- class: invert -->
```

---

## Default

[![](https://user-images.githubusercontent.com/3993388/48039490-53be1b80-e1b8-11e8-8179-0e6c11d285e2.png)][example]
[![invert](https://user-images.githubusercontent.com/3993388/48039492-5456b200-e1b8-11e8-9975-c9e4029d9036.png)][example]

The default theme of Marp. It is based on [GitHub markdown style](https://github.com/sindresorhus/github-markdown-css), but optimized to the slide deck. Slide contents will be always vertically centered.

```markdown
<!-- theme: default -->
```

## Gaia

[![](https://user-images.githubusercontent.com/3993388/48039493-5456b200-e1b8-11e8-9c49-dd5d66d76c0d.png)][example]
[![invert](https://user-images.githubusercontent.com/3993388/48039494-5456b200-e1b8-11e8-8bb5-f4a250e902e1.png)][example]

Gaia theme is based on the classic design of [yhatt/marp](https://github.com/yhatt/marp).

Originally, this theme was created for a maintainer to use, and it's inspired from [azusa-colors](https://github.com/sanographix/azusa-colors/) keynote template.

```markdown
<!-- theme: gaia -->
```

### Features

#### `lead` class

![lead](https://user-images.githubusercontent.com/3993388/48040058-c62ffb00-e1ba-11e8-876d-c182a30714c6.png)

Contents of the slide will align to left-top by Gaia's default. But you can use `lead` class to be centering like [uncover theme](#uncover). It is useful for the leading page like a title slide.

```markdown
<!--
theme: gaia
class: lead
-->
```

> :information_source: Marpit's [Spot directive](https://marpit.marp.app/directives?id=apply-to-a-single-page-spot-directives) would be useful to apply `lead` class only into a current page.
>
> ```markdown
> <!-- _class: lead -->
> ```

#### Color scheme

![gaia](https://user-images.githubusercontent.com/3993388/48040059-c62ffb00-e1ba-11e8-8026-fa3511844ec7.png)

Gaia theme supports an additional color scheme by `gaia` class.

```markdown
<!-- class: gaia -->
```

> :information_source: Of course you may use multiple classes, by array or separated string by space.
>
> ```markdown
> ---
> theme: gaia
> class:
>   - lead
>   - invert
> ---
>
> # Lead + invert
>
> ---
>
> <!-- class: lead gaia -->
>
> # Lead + gaia
> ```

### Custom color (CSS variables)

Color scheme for Gaia theme has defined by CSS variables. You also can use the custom color scheme by inline style.

```html
<style>
  :root {
    --color-background: #fff !important;
    --color-foreground: #333 !important;
    --color-highlight: #f96 !important;
    --color-dimmed: #888 !important;
  }
</style>
```

`!important` is required to make custom colors force against specific color defined by HTML classes like `invert` and `gaia`. See also: [marp-team/marp-core#221](https://github.com/marp-team/marp-core/pull/221)

## Uncover

[![](https://user-images.githubusercontent.com/3993388/48039495-5456b200-e1b8-11e8-8c82-ca7f7842b34d.png)][example]
[![invert](https://user-images.githubusercontent.com/3993388/48039496-54ef4880-e1b8-11e8-9c22-f3309b101e3c.png)][example]

Uncover theme has three design concepts: simple, minimal, and modern. It's inspired from many slide deck frameworks, especially [reveal.js](https://revealjs.com/).

```markdown
<!-- theme: uncover -->
```

### :warning: Restrictions

_[Auto-scaling for code block](https://github.com/marp-team/marp-core#auto-scaling-features) is disabled_ because uncover theme uses the elastic style that has not compatible with it.

### Custom color (CSS variables)

Color scheme for Uncover theme has defined by CSS variables. You also can use the custom color scheme by inline style.

```html
<style>
  :root {
    --color-background: #ddd !important;
    --color-background-code: #ccc !important;
    --color-background-paginate: rgba(128, 128, 128, 0.05) !important;
    --color-foreground: #345 !important;
    --color-highlight: #99c !important;
    --color-highlight-hover: #aaf !important;
    --color-highlight-heading: #99c !important;
    --color-header: #bbb !important;
    --color-header-shadow: transparent !important;
  }
</style>
```

`!important` is required to make custom colors force against specific color defined by HTML classes like `invert`. See also: [marp-team/marp-core#221](https://github.com/marp-team/marp-core/pull/221)

# Metadata for additional features

Marp Core's extended theming system will recognize the metadata to be able to enable extra features whose a side effect to the original DOM structure/the slide design through the manipulation.

In other words, the enabled feature requires taking care of the manipulated DOM and the view when styling.

**_If you never want to think complex styling, it's better to define no extra metadata._** Your theme would work as same as a simple [Marpit theme CSS](https://marpit.marp.app/theme-css) if you do nothing.

## `@auto-scaling [flag(s)]`

Enable [auto-scaling features](https://github.com/marp-team/marp-core#auto-scaling-features).

- `true`: Enable all features.
- `fittingHeader`: Enable fitting header.
- `math`: Enable scaling for KaTeX math block. _Please note that MathJax math block always will apply auto scaling down._
- `code`: Enable scaling for code block.

Through separating by comma, it can select multiple keywords for individual features.

```css
/**
 * @theme foobar
 * @auto-scaling fittingHeader,math
 */
```

## `@size [name] [width] [height]`

Define size preset(s) for usable in [`size` global directive](https://github.com/marp-team/marp-core#size-global-directive).

```css
/**
 * @theme foobar
 * @size 4:3 960px 720px
 * @size 16:9 1280px 720px
 * @size 4K 3840px 2160px
 */

section {
  /* A way to define default size is as same as Marpit theme CSS. */
  width: 960px;
  height: 720px;
}
```

User can choose a customized size of slide deck (`section`) from defined presets via `size` global directive.

```markdown
---
theme: foobar
size: 4K
---

# Slide deck for 4K screen (3840x2160)
```

When the imported theme through [`@import "foo";`](https://marpit.marp.app/theme-css?id=import-rule) or [`@import-theme "bar";`](https://marpit.marp.app/theme-css?id=import-theme-rule) has `@size` metadata(s), these presets still can use in an inherited theme.

Or you can use `@size [name] false` in the inherited theme if you need to disable specific preset.

```css
/**
 * gaia-16-9 theme is based on Gaia theme, but 4:3 slide cannot use.
 *
 * @theme inherited-from-gaia
 * @size 4:3 false
 */

@import 'gaia';
```
