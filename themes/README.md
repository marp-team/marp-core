# Marp-core built-in themes

We provide some nice official themes in marp-core. You can choose a favorite theme by using [Marpit `theme` directive](https://marpit.marp.app/directives?id=theme) in your Markdown.

Screenshots were taken from the rendered result of [an example][example].

[example]: _example.md

### `invert` class

The all of built-in themes support `invert` class to use the inverted color scheme.

```markdown
<!-- class: invert -->
```

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

## Uncover

[![](https://user-images.githubusercontent.com/3993388/48039495-5456b200-e1b8-11e8-8c82-ca7f7842b34d.png)][example]
[![invert](https://user-images.githubusercontent.com/3993388/48039496-54ef4880-e1b8-11e8-9c22-f3309b101e3c.png)][example]

Uncover theme has three design concepts: simple, minimal, and modern. It's inspired from many slide deck frameworks, especially [reveal.js](https://revealjs.com/).

```markdown
<!-- theme: uncover -->
```

### :warning: Restrictions

[Auto scaling for code block](https://github.com/marp-team/marp-core#auto-scaling-features) is disabled because uncover theme uses the elastic style that has not compatible with it.
