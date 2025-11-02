# Change Log

## [Unreleased]

## v4.2.0 - 2025-11-02

### Changed

- Upgrade Marpit to [v3.2.0](https://github.com/marp-team/marpit/releases/v3.2.0) ([#403](https://github.com/marp-team/marp-core/pull/403), [#404](https://github.com/marp-team/marp-core/pull/404))
  - PostCSS plugin support by `use()` instance method
- Upgrade development Node.js LTS and dependent packages to the latest version ([#404](https://github.com/marp-team/marp-core/pull/404))
- Update PostCSS integrations to use Marpit's PostCSS plugin support ([#406](https://github.com/marp-team/marp-core/issues/406), [#407](https://github.com/marp-team/marp-core/pull/407))
- Use `color-scheme` and `light-dark()` to define color scheme in built-in themes ([#396](https://github.com/marp-team/marp-core/issues/396), [#408](https://github.com/marp-team/marp-core/pull/408))

## v4.1.0 - 2025-05-16

### Added

- Transform Unicode 16 emojis into Twemoji images ([#399](https://github.com/marp-team/marp-core/pull/399))
- Test against Node.js 24 ([#399](https://github.com/marp-team/marp-core/pull/399))

### Changed

- Upgrade Marpit to [v3.1.3](https://github.com/marp-team/marpit/releases/v3.1.3) ([#398](https://github.com/marp-team/marp-core/pull/398), [#399](https://github.com/marp-team/marp-core/pull/399))
- Upgrade development Node.js LTS and dependent packages to the latest version ([#399](https://github.com/marp-team/marp-core/pull/399))

## v4.0.1 - 2024-12-24

### Security

- Fixed: Improper neutralization of HTML sanitization by comments that may lead to XSS ([CVE-2024-56510](https://github.com/marp-team/marp-core/security/advisories/GHSA-x52f-h5g4-8qv5) reported by [@Ry0taK](https://github.com/Ry0taK))

### Changed

- Upgrade Marpit to [v3.1.2](https://github.com/marp-team/marpit/releases/v3.1.2) ([#390](https://github.com/marp-team/marp-core/pull/390))
- Upgrade development Node.js LTS and dependent packages to the latest version ([#391](https://github.com/marp-team/marp-core/pull/391))

## v4.0.0 - 2024-09-09

> [!IMPORTANT]
> The new slide container styles, `block` container and safe centering, produce breaking changes to existing slide layouts. ([#382](https://github.com/marp-team/marp-core/pull/382))
>
> If you are using the built-in theme that contents are vertically centered (or the custom theme that depends on such themes), you can tweak the style in Markdown or the custom theme to get back the previous `flex` container.
>
> - For `default` and `uncover` theme:
>
>   ```html
>   <style>
>     section {
>       display: flex;
>     }
>   </style>
>   ```
>
> - For `gaia` theme's `lead` class:
>
>   ```html
>   <style>
>     section.lead {
>       display: flex;
>     }
>   </style>
>   ```

### Breaking

- Drop support against end-of-life Node.js versions (v16 and earlier), and now v18+ are required ([#359](https://github.com/marp-team/marp-core/pull/359))
- The slide container of built-in themes became the block element and adopted safe centering ([#372](https://github.com/marp-team/marp-core/issues/372), [#382](https://github.com/marp-team/marp-core/pull/382))

### Added

- Transform emojis up to Unicode 15.1 into Twemoji images ([#380](https://github.com/marp-team/marp-core/pull/380))

### Changed

- Upgrade Marpit to [v3.1.1](https://github.com/marp-team/marpit/releases/v3.1.1) ([#378](https://github.com/marp-team/marp-core/pull/378))
  - Bump markdown-it to [v14.1.0](https://github.com/markdown-it/markdown-it/blob/master/CHANGELOG.md#1410---2024-03-19), and follow the latest spec of [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/)
  - Support for CSS nesting (`cssNesting` constructor option)
- Use simpler CSS minification when `minifyCSS` option is enabled ([#381](https://github.com/marp-team/marp-core/pull/381))
- Relax HTML allowlist: Allowed a lot of HTML elements and attributes by default ([#301](https://github.com/marp-team/marp-core/issues/301), [#383](https://github.com/marp-team/marp-core/pull/383))
- Make the image background transparent in `default` theme ([#196](https://github.com/marp-team/marp-core/issues/196), [#371](https://github.com/marp-team/marp-core/issues/371), [#386](https://github.com/marp-team/marp-core/pull/386))

* Upgrade development Node.js to v20 LTS ([#359](https://github.com/marp-team/marp-core/pull/359))
* Upgrade dependent packages to the latest version ([#380](https://github.com/marp-team/marp-core/pull/380))
* Switch package manager from yarn to npm ([#379](https://github.com/marp-team/marp-core/pull/379))
* Migrate ESLint config to Flat config ([#385](https://github.com/marp-team/marp-core/pull/385))

### Fixed

- Suppress uncaught `DOMException` error while upgrading `<marp-pre>` Web Component elements in Firefox ([#370](https://github.com/marp-team/marp-core/issues/370), [#384](https://github.com/marp-team/marp-core/pull/384))

## v3.9.1 - 2024-12-24

### Security

- Improper neutralization of HTML sanitization by comments may lead to XSS ([CVE-2024-56510](https://github.com/marp-team/marp-core/security/advisories/GHSA-x52f-h5g4-8qv5) reported by [@Ry0taK](https://github.com/Ry0taK))

## v3.9.0 - 2023-10-15

### Added

- Enabled [`cssContainerQuery` constructor option from Marpit framework](https://marpit-api.marp.app/marpit#Marpit) by default ([#360](https://github.com/marp-team/marp-core/pull/360))

### Changed

- Upgrade Marpit to [v2.6.1](https://github.com/marp-team/marpit/releases/v2.6.1) ([#358](https://github.com/marp-team/marp-core/pull/358))
  - Added `cssContainerQuery` constructor option
  - Added `lang` global directive and constructor option
- Slightly changed the color scheme of `default` theme to match as the current GitHub style ([#358](https://github.com/marp-team/marp-core/pull/358))
- Upgrade Node.js and dependent packages to the latest version ([#358](https://github.com/marp-team/marp-core/pull/358))

## v3.8.1 - 2023-09-11

### Changed

- Upgrade Marpit to [v2.5.3](https://github.com/marp-team/marpit/releases/v2.5.3) ([#357](https://github.com/marp-team/marp-core/pull/357))

### Fixed

- Regression: Auto-scaling for KaTeX block is always enabled regardless of `@auto-scaling` theme metadata ([#353](https://github.com/marp-team/marp-core/issues/353), [#354](https://github.com/marp-team/marp-core/pull/354))

## v3.8.0 - 2023-08-01

### Added

- `highlightjs` getter, to access the generated highlight.js instance per Marp Core instances ([#350](https://github.com/marp-team/marp-core/pull/350))

### Changed

- Marp Core instance is no longer using the shared highlight.js instance ([#350](https://github.com/marp-team/marp-core/pull/350))
- Upgrade Node.js and dependent packages to the latest version ([#351](https://github.com/marp-team/marp-core/pull/351))

## v3.7.0 - 2023-06-09

### Changed

- Upgrade Marpit to [v2.5.0](https://github.com/marp-team/marpit/releases/v2.5.0) ([#342](https://github.com/marp-team/marp-core/pull/342))
  - Added `paginate: skip` and `paginate: hold`
- Upgrade Node.js and dependent packages to the latest version ([#345](https://github.com/marp-team/marp-core/pull/345))

### Fixed

- Regression: Not working `emoji.twemoji.base` constructor option ([#343](https://github.com/marp-team/marp-core/issues/343), [#344](https://github.com/marp-team/marp-core/pull/344))

## v3.6.0 - 2023-04-01

### Added

- Assign auto-generated slug to `id` attribute of each headings ([#299](https://github.com/marp-team/marp-core/issues/299), [#338](https://github.com/marp-team/marp-core/pull/338))
- `slug` constructor option ([#338](https://github.com/marp-team/marp-core/pull/338))

### Changed

- Upgrade Node.js and dependent packages ([#336](https://github.com/marp-team/marp-core/pull/336))
- Use `@twemoji/api` package instead of `twemoji` ([#337](https://github.com/marp-team/marp-core/pull/337))

## v3.5.0 - 2023-02-18

### Changed

- Upgrade marpit-svg-polyfill to [v2.1.0](https://github.com/marp-team/marpit-svg-polyfill/releases/tag/v2.1.0) ([#329](https://github.com/marp-team/marp-core/pull/329))
- Upgrade Node.js and dependencies ([#331](https://github.com/marp-team/marp-core/pull/331))

### Deprecated

- An `observer()` function exported by `@marp-team/marp-core/browser`, which was actually designed for internal ([#330](https://github.com/marp-team/marp-core/pull/330))

## v3.4.2 - 2023-01-08

### Fixed

- Patch KaTeX style to fix visibility of some math symbol in Chromium-flavored browsers ([#326](https://github.com/marp-team/marp-core/pull/326))

### Changed

- Upgrade Node and dependent packages ([#327](https://github.com/marp-team/marp-core/pull/327))

## v3.4.1 - 2022-12-24

### Changed

- Bundle external modules used by emoji plugin ([#323](https://github.com/marp-team/marp-core/pull/323))
- Upgrade dependent packages to the latest version ([#325](https://github.com/marp-team/marp-core/pull/325))

## v3.4.0 - 2022-11-19

### Added

- Test against Node.js 18 LTS ([#318](https://github.com/marp-team/marp-core/pull/318))

### Changed

- Change CDN for Twemoji images from default to jsDelivr ([#320](https://github.com/marp-team/marp-core/issues/320), [#321](https://github.com/marp-team/marp-core/pull/321))
- Upgrade Marpit to [v2.4.2](https://github.com/marp-team/marpit/releases/v2.4.2) ([#318](https://github.com/marp-team/marp-core/pull/318))
- Upgrade development Node.js and dependent packages ([#318](https://github.com/marp-team/marp-core/pull/318))

### Removed

- Test against no longer supported Node.js 12 ([#318](https://github.com/marp-team/marp-core/pull/318))

## v3.3.3 - 2022-09-08

### Fixed

- Prebundle PostCSS plugins for `minifyCSS` option, to fix incompatibility with ESM ([#314](https://github.com/marp-team/marp-core/issues/314), [#315](https://github.com/marp-team/marp-core/pull/315))

## v3.3.2 - 2022-08-12

### Fixed

- Flush display of `<marp-auto-scaling>` only when resized the scaling wrapper ([#313](https://github.com/marp-team/marp-core/pull/313))

## v3.3.1 - 2022-08-11

### Fixed

- Apply workaround for vanished `<marp-auto-scaling>` in Chrome 105+ ([#312](https://github.com/marp-team/marp-core/pull/312))

## v3.3.0 - 2022-08-11

### Changed

- Upgrade Marpit to [v2.4.0](https://github.com/marp-team/marpit/releases/v2.4.0) ([#310](https://github.com/marp-team/marp-core/pull/310))
  - `anchor` constructor option for slide anchor customization
- Upgrade dependent packages to the latest version ([#310](https://github.com/marp-team/marp-core/pull/310))
- Replace Google Fonts in `gaia` theme to Bunny Fonts ([#311](https://github.com/marp-team/marp-core/pull/311))

## v3.2.1 - 2022-06-05

### Fixed

- Decrease specificity of highlight.js classes for `default` theme ([#304](https://github.com/marp-team/marp-core/pull/304), [#307](https://github.com/marp-team/marp-core/pull/307))
- Apply hydration for custom elements whenever calling browser script ([#305](https://github.com/marp-team/marp-core/pull/305))
- An empty auto-scaling component becomes unnecessary bigger ([#306](https://github.com/marp-team/marp-core/pull/306))

## v3.2.0 - 2022-05-21

### Changed

- Marp Core v3 is available as stable release ([See v3.0.0 release note about major changes](https://github.com/marp-team/marp-core/releases/tag/v3.0.0)) ([#302](https://github.com/marp-team/marp-core/pull/302))
- Upgrade Marpit to [v2.3.1](https://github.com/marp-team/marpit/releases/v2.3.1) ([#298](https://github.com/marp-team/marp-core/pull/298), [#300](https://github.com/marp-team/marp-core/pull/300))
- Upgrade dependent packages to the latest version ([#298](https://github.com/marp-team/marp-core/pull/298))

## v3.1.2 - 2022-04-24

### Fixed

- Make compatible with a patched markdown-it-emoji ([#294](https://github.com/marp-team/marp-core/pull/294))

## v3.1.1 - 2022-04-12

### Changed

- Upgrade Marpit to [v2.2.4](https://github.com/marp-team/marpit/releases/v2.2.4) ([#291](https://github.com/marp-team/marp-core/pull/291))
  - Fixed: Scoped style does not style pseudo elements `section::before` and `section::after` in advanced background
- Upgrade marpit-svg-polyfill to [v2.0.0](https://github.com/marp-team/marpit-svg-polyfill/releases/tag/v2.0.0) ([#291](https://github.com/marp-team/marp-core/pull/291))
- Upgrade dependent packages to the latest version ([#291](https://github.com/marp-team/marp-core/pull/291))

## v3.1.0 - 2022-03-29

### Added

- Transform Unicode 14.0 emojis into images ([#289](https://github.com/marp-team/marp-core/pull/289))

### Fixed

- Disable thickening MathJax strokes in print media ([#287](https://github.com/marp-team/marp-core/issues/287), [#290](https://github.com/marp-team/marp-core/pull/290))

### Changed

- Upgrade Marpit to [v2.2.3](https://github.com/marp-team/marpit/releases/v2.2.3) ([#289](https://github.com/marp-team/marp-core/pull/289))
- Upgrade Node and dependent packages to the latest version ([#289](https://github.com/marp-team/marp-core/pull/289))

## v3.0.2 - 2022-01-23

### Fixed

- Refactor auto scaling component ([#276](https://github.com/marp-team/marp-core/pull/276))
- Preserve HTML comments within html block ([#282](https://github.com/marp-team/marp-core/pull/282))

### Changed

- Upgrade Marpit to [v2.2.2](https://github.com/marp-team/marpit/releases/v2.2.2) ([#281](https://github.com/marp-team/marp-core/pull/281))
- Upgrade dependent packages to the latest version ([#281](https://github.com/marp-team/marp-core/pull/281))

## v3.0.1 - 2022-01-08

### Changed

- Upgrade Marpit to [v2.2.1](https://github.com/marp-team/marpit/releases/v2.2.1) ([#275](https://github.com/marp-team/marp-core/pull/275))
- Upgrade dependent packages to the latest version ([#275](https://github.com/marp-team/marp-core/pull/275))

## v3.0.0 - 2021-11-22

### ⚡️ Breaking

- Dropped Node 10 support and now requires the latest version of Node.js v12 and later ([#260](https://github.com/marp-team/marp-core/issues/260), [#266](https://github.com/marp-team/marp-core/pull/266))
- Changed the default library for math typesetting from KaTeX to MathJax ([#159](https://github.com/marp-team/marp-core/issues/159), [#236](https://github.com/marp-team/marp-core/issues/236), [#271](https://github.com/marp-team/marp-core/pull/271))

### Added

- Auto-scaling for code block in `uncover` theme ([#263](https://github.com/marp-team/marp-core/pull/263))
- Allow color customization through CSS variables in `default` theme ([#209](https://github.com/marp-team/marp-core/issues/209), [#266](https://github.com/marp-team/marp-core/issues/266))

### Changed

- Web Components based new auto scaling ([#96](https://github.com/marp-team/marp-core/issues/96), [#248](https://github.com/marp-team/marp-core/issues/248), [#263](https://github.com/marp-team/marp-core/pull/263))
- Match color schemes for `default` theme to the latest GitHub ([#266](https://github.com/marp-team/marp-core/issues/266))
- Adopt `::where()` selector to class variants for making styles overridable ([#244](https://github.com/marp-team/marp-core/issues/244), [#267](https://github.com/marp-team/marp-core/pull/267))
- Disable autolink for URL text that has no `http(s)://` protocol ([#268](https://github.com/marp-team/marp-core/pull/268))

---

<details><summary>History of versions older than v3</summary>

## v2.4.2 - 2022-04-24

### Fixed

- Make compatible with a patched markdown-it-emoji ([#294](https://github.com/marp-team/marp-core/pull/294))

## v2.4.1 - 2022-04-12

### Changed

- Upgrade Marpit to [v2.2.4](https://github.com/marp-team/marpit/releases/v2.2.4) ([#291](https://github.com/marp-team/marp-core/pull/291))
  - Fixed: Scoped style does not style pseudo elements `section::before` and `section::after` in advanced background
- Upgrade marpit-svg-polyfill to [v2.0.0](https://github.com/marp-team/marpit-svg-polyfill/releases/tag/v2.0.0) ([#291](https://github.com/marp-team/marp-core/pull/291))
- Upgrade dependent packages to the latest version ([#291](https://github.com/marp-team/marp-core/pull/291))

## v2.4.0 - 2022-03-29

### Added

- Transform Unicode 14.0 emojis into images ([#289](https://github.com/marp-team/marp-core/pull/289))

### Fixed

- Disable thickening MathJax strokes in print media ([#287](https://github.com/marp-team/marp-core/issues/287), [#290](https://github.com/marp-team/marp-core/pull/290))

### Changed

- Upgrade Marpit to [v2.2.3](https://github.com/marp-team/marpit/releases/v2.2.3) ([#289](https://github.com/marp-team/marp-core/pull/289))
- Upgrade Node and dependent packages to the latest version ([#289](https://github.com/marp-team/marp-core/pull/289))

## v2.3.2 - 2022-01-23

### Fixed

- Preserve HTML comments within html block ([#282](https://github.com/marp-team/marp-core/pull/282))

### Changed

- Upgrade Marpit to [v2.2.2](https://github.com/marp-team/marpit/releases/v2.2.2) ([#281](https://github.com/marp-team/marp-core/pull/281))
- Upgrade dependent packages to the latest version ([#281](https://github.com/marp-team/marp-core/pull/281))

## v2.3.1 - 2022-01-08

### Changed

- Upgrade Marpit to [v2.2.1](https://github.com/marp-team/marpit/releases/v2.2.1) ([#275](https://github.com/marp-team/marp-core/pull/275))
- Upgrade dependent packages to the latest version ([#275](https://github.com/marp-team/marp-core/pull/275))

## v2.3.0 - 2021-11-22

### Changed

- Upgrade Marpit to [v2.2.0](https://github.com/marp-team/marpit/releases/v2.2.0) ([#273](https://github.com/marp-team/marp-core/pull/273))
  - [`::backdrop` pseudo-element](https://marpit.marp.app/inline-svg?id=backdrop-css-selector) matches to the container SVG
- Upgrade development Node to v16 LTS ([#265](https://github.com/marp-team/marp-core/pull/265))
- Upgrade dependent packages to the latest version ([#273](https://github.com/marp-team/marp-core/pull/273))

## v2.2.0 - 2021-10-29

### Changed

- Upgrade Marpit to [v2.1.2](https://github.com/marp-team/marpit/releases/v2.1.2) ([#262](https://github.com/marp-team/marp-core/pull/262))
- Upgrade dependent packages to the latest version ([#262](https://github.com/marp-team/marp-core/pull/262))
- Update `default` theme to match styles into the latest GitHub's light color scheme ([#262](https://github.com/marp-team/marp-core/pull/262))

## v2.1.1 - 2021-08-14

### Fixed

- Define the default 16:9 size preset to built-in themes ([#250](https://github.com/marp-team/marp-core/pull/250))

### Changed

- Upgrade Marpit to [v2.1.1](https://github.com/marp-team/marpit/releases/v2.1.1) ([#253](https://github.com/marp-team/marp-core/pull/253))
- Upgrade dependent packages to the latest version ([#253](https://github.com/marp-team/marp-core/pull/253))

## v2.1.0 - 2021-07-19

### Added

- `math` global directive for switching math typesetting library in current Markdown ([#243](https://github.com/marp-team/marp-core/issues/243), [#246](https://github.com/marp-team/marp-core/pull/246))

### Changed

- Upgrade dependent packages to the latest version ([#241](https://github.com/marp-team/marp-core/pull/241))

### Deprecated

- End-of-life Node.js 10 support (Still can use but no longer tested) ([#241](https://github.com/marp-team/marp-core/pull/241))

## v2.0.3 - 2021-05-17

### Fixed

- Fitting header with single emoji has unexpected zoom animation ([#232](https://github.com/marp-team/marp-core/issues/232), [#233](https://github.com/marp-team/marp-core/pull/233))

### Changed

- Upgrade dependent packages to the latest version ([#234](https://github.com/marp-team/marp-core/pull/234))

## v2.0.2 - 2021-05-08

### Fixed

- Fix to work `markdown.typographer` option ([#228](https://github.com/marp-team/marp-core/pull/228))

### Changed

- Upgrade dependent packages to the latest version ([#229](https://github.com/marp-team/marp-core/pull/229))

## v2.0.1 - 2021-04-27

### Changed

- Upgrade Marpit to [v2.0.1](https://github.com/marp-team/marpit/releases/v2.0.1) ([#225](https://github.com/marp-team/marp-core/pull/225))
- Upgrade dependent packages to the latest version ([#225](https://github.com/marp-team/marp-core/pull/225))

## v2.0.0 - 2021-04-24

### Added

- Allow color customization through CSS variables in Gaia and Uncover theme ([#209](https://github.com/marp-team/marp-core/issues/209), [#221](https://github.com/marp-team/marp-core/pull/221))

> May break appearance of existing presentation if you have a slide with custom style.

### Changed

- Upgrade Marpit to [v2.0.0](https://github.com/marp-team/marpit/releases/v2.0.0) ([#220](https://github.com/marp-team/marp-core/pull/220))
- Upgrade Node LTS and dependent packages to the latest version ([#222](https://github.com/marp-team/marp-core/pull/222))

## v1.5.0 - 2021-04-02

### Fixed

- Fixed a deprecation warning of highlight.js ([#219](https://github.com/marp-team/marp-core/issues/219))

### Changed

- Upgrade Node LTS and dependent packages to the latest version ([#219](https://github.com/marp-team/marp-core/pull/219))

## v1.4.3 - 2021-02-11

### Fixed

- KaTeX does not be rendered together with header/footer ([#214](https://github.com/marp-team/marp-core/issues/214), [#215](https://github.com/marp-team/marp-core/pull/215))

## v1.4.2 - 2021-02-07

### Changed

- Upgrade Marpit SVG polyfill to [v1.7.1](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.7.1) ([#213](https://github.com/marp-team/marp-core/pull/213))

## v1.4.1 - 2021-02-06

### Fixed

- KaTeX: Persist defined global macro between math renderings ([#212](https://github.com/marp-team/marp-core/pull/212))
- MathJax: Prevent leaking defined macro between Markdown renderings ([#212](https://github.com/marp-team/marp-core/pull/212))

### Changed

- Upgrade Marpit to [v1.6.4](https://github.com/marp-team/marpit/releases/v1.6.4) ([#210](https://github.com/marp-team/marp-core/pull/210))
- Upgrade dependent packages to the latest version ([#210](https://github.com/marp-team/marp-core/pull/210))
- Rename `master` branch into `main` ([#211](https://github.com/marp-team/marp-core/pull/211))

## v1.4.0 - 2020-12-05

### Breaking

- Stopped auto-detection of syntax highlight for code block ([#202](https://github.com/marp-team/marp-core/issues/202), [#205](https://github.com/marp-team/marp-core/pull/205))

### Added

- Support more emoji shorthands ([#203](https://github.com/marp-team/marp-core/pull/203))

### Changed

- Use Node 14 LTS for development ([#203](https://github.com/marp-team/marp-core/pull/203))
- Upgrade Marpit to [v1.6.3](https://github.com/marp-team/marpit/releases/v1.6.3) ([#203](https://github.com/marp-team/marp-core/pull/203))
- Upgrade dependent packages to the latest version ([#203](https://github.com/marp-team/marp-core/pull/203))

### Removed

- `observer()` with boolean argument in `@marp-team/marp-core/browser` ([#204](https://github.com/marp-team/marp-core/pull/204))

## v1.3.0 - 2020-08-18

### Changed

- Upgrade Marpit SVG polyfill to [v1.7.0](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.7.0) ([#184](https://github.com/marp-team/marp-core/pull/184), [#185](https://github.com/marp-team/marp-core/pull/185))
- Update browser script to make changeable the target root ([#185](https://github.com/marp-team/marp-core/pull/185))
- Upgrade dependent packages to the latest version ([#186](https://github.com/marp-team/marp-core/pull/186))

### Deprecated

- `observer()` with boolean argument from `@marp-team/marp-core/browser` has been deprecated in favor of the usage of the option object ([#185](https://github.com/marp-team/marp-core/pull/185))

## v1.2.2 - 2020-07-18

### Added

- Setup GitHub Dependabot for marp-team packages ([#172](https://github.com/marp-team/marp-core/pull/172))

### Changed

- Upgrade Marpit SVG polyfill to [v1.5.0](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.5.0) ([#176](https://github.com/marp-team/marp-core/pull/176))

## v1.2.1 - 2020-07-09

### Added

- Test against Node 14 ([#171](https://github.com/marp-team/marp-core/pull/171))

### Changed

- Upgrade Marpit SVG polyfill to [v1.4.0](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.4.0) ([#170](https://github.com/marp-team/marp-core/pull/170))
- Upgrade development Node LTS and dependent packages to the latest version ([#170](https://github.com/marp-team/marp-core/pull/170))
- Migrate from TSLint to ESLint ([#169](https://github.com/marp-team/marp-core/pull/169))

## v1.2.0 - 2020-06-08

### Added

- Transform Unicode 13.0 emojis into SVG images ([#167](https://github.com/marp-team/marp-core/pull/167))
- Add MathJax v3 support to math plugin ([#164](https://github.com/marp-team/marp-core/issues/164), [#165](https://github.com/marp-team/marp-core/pull/165) by [@tani](https://github.com/tani), [#166](https://github.com/marp-team/marp-core/pull/166))
- Add sandbox directory to make easy to develop core ([#157](https://github.com/marp-team/marp-core/pull/157))

### Changed

- Upgrade Marpit to [v1.6.2](https://github.com/marp-team/marpit/releases/v1.6.2) and Marpit SVG polyfill to [v1.3.0](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.3.0) ([#167](https://github.com/marp-team/marp-core/pull/167))
- Upgrade dependent packages to the latest version ([#167](https://github.com/marp-team/marp-core/pull/167))

## v1.1.1 - 2020-04-18

### Changed

- Upgrade Marpit to [v1.5.2](https://github.com/marp-team/marpit/releases/v1.5.2) ([#156](https://github.com/marp-team/marp-core/pull/156))
- Upgrade dependent packages to the latest version ([#154](https://github.com/marp-team/marp-core/pull/154), [#156](https://github.com/marp-team/marp-core/pull/156))

## v1.1.0 - 2020-03-15

### Changed

- Upgrade Marpit to [v1.5.1](https://github.com/marp-team/marpit/releases/v1.5.1) ([#153](https://github.com/marp-team/marp-core/pull/153))
- Upgrade Node and dependent packages to the latest version ([#153](https://github.com/marp-team/marp-core/pull/153))

## v1.0.1 - 2020-01-17

### Fixed

- v1.0.0 throws "z is not a function" ([#146](https://github.com/marp-team/marp-core/issues/146), [#147](https://github.com/marp-team/marp-core/pull/147))

## v1.0.0 - 2020-01-13

### Breaking

- Marp Core requires Node >= 10 ([#143](https://github.com/marp-team/marp-core/pull/143))

### Added

- Expose selected size as `data-size` attribute ([#135](https://github.com/marp-team/marp-core/issues/135), [#144](https://github.com/marp-team/marp-core/pull/144))

### Changed

- Upgrade Marpit to [v1.5.0](https://github.com/marp-team/marpit/releases/v1.5.0) ([#142](https://github.com/marp-team/marp-core/pull/142))
- Update community health files ([#133](https://github.com/marp-team/marp-core/pull/133))
- Upgrade Node and dependent packages to the latest version ([#138](https://github.com/marp-team/marp-core/pull/138), [#143](https://github.com/marp-team/marp-core/pull/143))

### Removed

- EOL Node 8 is no longer supported ([#143](https://github.com/marp-team/marp-core/pull/143))
- Remove deprecated `Marp.ready()` (Use `@marp-team/marp-core/browser` entrypoint) ([#145](https://github.com/marp-team/marp-core/pull/145))

## v0.15.2 - 2019-11-18

### Fixed

- Fix visual regression by moving script position to after closing section ([#131](https://github.com/marp-team/marp-core/pull/131))

### Changed

- Upgrade dependent packages to the latest version ([#130](https://github.com/marp-team/marp-core/pull/130))

## v0.15.1 - 2019-11-06

### Changed

- Upgrade Marpit to [v1.4.2](https://github.com/marp-team/marpit/releases/v1.4.2) ([#126](https://github.com/marp-team/marp-core/pull/126))
- Upgrade dependent packages to the latest version ([#126](https://github.com/marp-team/marp-core/pull/126))

### Removed

- Remove dollar prefix plugin for obsoleted syntax ([#127](https://github.com/marp-team/marp-core/pull/127))

## v0.15.0 - 2019-11-05

### Added

- GFM strikethrough syntax ([#102](https://github.com/marp-team/marp-core/issues/102), [#124](https://github.com/marp-team/marp-core/pull/124) by [@matsubara0507](https://github.com/matsubara0507))

### Fixed

- Fix type definition for browser to export default func ([#120](https://github.com/marp-team/marp-core/pull/120))

### Changed

- Upgrade Node for development to v12 LTS ([#125](https://github.com/marp-team/marp-core/pull/125))
- Upgrade dependent packages to the latest version ([#125](https://github.com/marp-team/marp-core/pull/125))

## v0.14.0 - 2019-10-19

### Added

- Inject the inline helper script for browser into rendered Markdown automatically ([#115](https://github.com/marp-team/marp-core/pull/115))
- Add `script` constructor option ([#115](https://github.com/marp-team/marp-core/pull/115))

### Changed

- Upgrade Marpit to [v1.4.1](https://github.com/marp-team/marpit/releases/v1.4.1) ([#113](https://github.com/marp-team/marp-core/pull/113))
- Upgrade dependent packages to the latest version ([#109](https://github.com/marp-team/marp-core/pull/109), [#113](https://github.com/marp-team/marp-core/pull/113))
- Apply `font-display: swap` to Google Fonts in gaia theme ([#114](https://github.com/marp-team/marp-core/pull/114))
- Define `word-wrap` css property as `break-word` in gaia and uncover theme ([#108](https://github.com/marp-team/marp-core/pull/108), [#119](https://github.com/marp-team/marp-core/pull/119))
- Reduce inconsistency about `html` option between Marp Core and markdown-it option ([#111](https://github.com/marp-team/marp-core/pull/111), [#117](https://github.com/marp-team/marp-core/pull/117))

### Deprecated

- `Marp.ready()` had deprecated in favor of new entrypoint `@marp-team/marp-core/browser` ([#115](https://github.com/marp-team/marp-core/pull/115))

### Removed

- Remove unused inline web font from default theme ([#116](https://github.com/marp-team/marp-core/pull/116))

## v0.13.1 - 2019-09-13

### Fixed

- Fix dollar prefix option to support `size` directive ([#107](https://github.com/marp-team/marp-core/pull/107))

## v0.13.0 - 2019-09-12

### Added

- Add `minifyCSS` option ([#103](https://github.com/marp-team/marp-core/pull/103))
- Add `dollarPrefixForGlobalDirectives` option _(not for users)_ ([#104](https://github.com/marp-team/marp-core/pull/104))

### Fixed

- Optimize default theme CSS by removing `.markdown-body` selector on build time ([#106](https://github.com/marp-team/marp-core/pull/106))

### Changed

- Update CircleCI configuration to use v2.1 ([#101](https://github.com/marp-team/marp-core/pull/101))
- Upgrade Marpit to [v1.4.0](https://github.com/marp-team/marpit/releases/v1.4.0) ([#105](https://github.com/marp-team/marp-core/pull/105))
- Upgrade Node and dependent packages to the latest version ([#105](https://github.com/marp-team/marp-core/pull/105))

## v0.12.1 - 2019-08-23

### Changed

- Upgrade Marpit to [v1.3.2](https://github.com/marp-team/marpit/releases/v1.3.2) ([#100](https://github.com/marp-team/marp-core/pull/100))
- Upgrade dependent packages to the latest version ([#100](https://github.com/marp-team/marp-core/pull/100))

## v0.12.0 - 2019-07-13

### Changed

- Upgrade Marpit to [v1.3.0](https://github.com/marp-team/marpit/releases/v1.3.0) and Marpit SVG polyfill to [v1.1.1](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.1.1) ([#97](https://github.com/marp-team/marp-core/pull/97), [#99](https://github.com/marp-team/marp-core/pull/99))
- Upgrade Node and dependent packages to the latest version ([#97](https://github.com/marp-team/marp-core/pull/97))

## v0.11.0 - 2019-06-24

### Added

- `size` global directive and `@size` theme metadata to get easier way for using 4:3 deck in built-in theme ([#91](https://github.com/marp-team/marp-core/issues/91), [#94](https://github.com/marp-team/marp-core/pull/94))

## v0.10.2 - 2019-06-21

### Fixed

- Improve bundle size of script for browser to be about one fifth ([#93](https://github.com/marp-team/marp-core/pull/93))

## v0.10.1 - 2019-06-17

### Changed

- Upgrade Marpit to [v1.2.0](https://github.com/marp-team/marpit/releases/v1.2.0) and Marpit SVG polyfill to [v1.0.0](https://github.com/marp-team/marpit-svg-polyfill/releases/v1.0.0) ([#92](https://github.com/marp-team/marp-core/pull/92))
- Upgrade Node and dependent packages to the latest version ([#92](https://github.com/marp-team/marp-core/pull/92))

## v0.10.0 - 2019-06-03

### Changed

- Upgrade Marpit to [v1.1.0](https://github.com/marp-team/marpit/releases/v1.1.0) ([#89](https://github.com/marp-team/marp-core/pull/89))
- Upgrade dependent packages to the latest version ([#89](https://github.com/marp-team/marp-core/pull/89))

## v0.9.0 - 2019-05-06

### Breaking

- Marp Core requires Node >= 8.

### Added

- Shorthand for text color by image syntax, from Marpit v1 ([#87](https://github.com/marp-team/marp-core/pull/87))
- Test with Node 12 (Erbium) ([#87](https://github.com/marp-team/marp-core/pull/87))
- Automate GitHub release ([#87](https://github.com/marp-team/marp-core/pull/87))

### Fixed

- Improve rendering compatibility of uncover theme's pagination in PDF.js ([#84](https://github.com/marp-team/marp-core/pull/84), [#86](https://github.com/marp-team/marp-core/pull/86))

### Changed

- Upgrade Marpit to v1 ([#87](https://github.com/marp-team/marp-core/pull/87))
- Swap Sass compiler from node-sass to Dart Sass ([#87](https://github.com/marp-team/marp-core/pull/87))

### Removed

- Remove unnecessary dependency of markdown-it ([#88](https://github.com/marp-team/marp-core/pull/88))

## v0.8.0 - 2019-04-08

### Breaking

- Change auto-scaling features to require enabling by `@auto-scaling` metadata of theme CSS explicitly ([#72](https://github.com/marp-team/marp-core/issues/72), [#81](https://github.com/marp-team/marp-core/pull/81))

### Changed

- Upgrade Marpit to [v0.9.2](https://github.com/marp-team/marpit/releases/v0.9.2) ([#80](https://github.com/marp-team/marp-core/pull/80), [#82](https://github.com/marp-team/marp-core/pull/82))
- Upgrade dependent packages to the latest version ([#82](https://github.com/marp-team/marp-core/pull/82))

### Removed

- Deprecated `twemojiBase` option ([#80](https://github.com/marp-team/marp-core/pull/80))

## v0.7.1 - 2019-03-20

### Fixed

- Fix incorrect scaling in WebKit browser with custom zoom factor, by updating `@marp-team/marpit-svg-polyfill` to [v0.3.0](https://github.com/marp-team/marpit-svg-polyfill/releases/v0.3.0) ([#79](https://github.com/marp-team/marp-core/pull/79))

## v0.7.0 - 2019-03-13

### Added

- Direction keyword for background images, from [Marpit v0.8.0](https://github.com/marp-team/marpit/releases/v0.8.0) ([#76](https://github.com/marp-team/marp-core/pull/76))

### Changed

- Upgrade Node and dependent packages to the latest ([#76](https://github.com/marp-team/marp-core/pull/76))
- Output warning when used deprecated `twemojiBase` option ([#77](https://github.com/marp-team/marp-core/pull/77))

## v0.6.2 - 2019-03-09

### Changed

- Use markdown-it's `html` option instead of Marp Core option to sanitize HTML ([#74](https://github.com/marp-team/marp-core/pull/74))
- Upgrade dependent packages to the latest ([#75](https://github.com/marp-team/marp-core/pull/75))

## v0.6.1 - 2019-02-13

### Removed

- Remove dependency to PostCSS ([#71](https://github.com/marp-team/marp-core/pull/71))

### Changed

- Upgrade dependent packages to the latest ([#73](https://github.com/marp-team/marp-core/pull/73))

## v0.6.0 - 2019-02-04

### Added

- Allow using twemoji via PNG by added `emoji.twemoji.ext` option ([#67](https://github.com/marp-team/marp-core/pull/67))
- Support custom sanitizer for HTML attributes within allowlist ([#68](https://github.com/marp-team/marp-core/pull/68))
- Add usage of multiple classes in Gaia theme ([#69](https://github.com/marp-team/marp-core/pull/69))

### Fixed

- Fix over-sanitized attributes with HTML allowlist ([#68](https://github.com/marp-team/marp-core/pull/68))

### Changed

- Normalize known self-closing HTML elements with `xhtmlOut: true` ([#66](https://github.com/marp-team/marp-core/pull/66))
- Upgrade Node and dependent packages to the latest ([#70](https://github.com/marp-team/marp-core/pull/70))

### Deprecated

- `emoji.twemojiBase` option has soft-deprecated in favor of `emoji.twemoji.base` ([#67](https://github.com/marp-team/marp-core/pull/67))

## v0.5.2 - 2019-01-31

### Changed

- Upgrade dependent packages to latest version, includes [Marpit v0.7.0](https://github.com/marp-team/marpit/releases/tag/v0.7.0) ([#63](https://github.com/marp-team/marp-core/pull/63))
- Support an enhanced Marpit enable state ([#64](https://github.com/marp-team/marp-core/pull/64))

## v0.5.1 - 2019-01-26

### Changed

- Upgrade dependent packages to latest version, includes [Marpit v0.6.1](https://github.com/marp-team/marpit/releases/tag/v0.6.1) ([#62](https://github.com/marp-team/marp-core/pull/62))

## v0.5.0 - 2019-01-20

### Added

- Colored `<strong>` element in headings for highlighting ([#59](https://github.com/marp-team/marp-core/pull/59))
- Support `env` option and `htmlAsArray` env in `render()`, from [Marpit v0.6.0](https://github.com/marp-team/marpit/releases/v0.6.0) ([#61](https://github.com/marp-team/marp-core/pull/61))

### Fixed

- Prevent showing scrollbar in code block ([#60](https://github.com/marp-team/marp-core/pull/60))
- Use the real compiled Sass in test ([#61](https://github.com/marp-team/marp-core/pull/61))

### Changed

- Upgrade dependent packages to latest version ([#61](https://github.com/marp-team/marp-core/pull/61))

## v0.4.1 - 2018-12-31

### Fixed

- Fix incorrect scaling in Marpit SVG polyfill ([#58](https://github.com/marp-team/marp-core/pull/58))

## v0.4.0 - 2018-12-29

### Added

- Apply [Marpit SVG polyfill](https://github.com/marp-team/marpit-svg-polyfill) for WebKit in `Marp.ready()` ([#56](https://github.com/marp-team/marp-core/pull/56))

### Changed

- Update [Marpit v0.5.0](https://github.com/marp-team/marpit/releases/v0.5.0) ([#56](https://github.com/marp-team/marp-core/pull/56))
- Upgrade Node and dependent packages to latest version ([#57](https://github.com/marp-team/marp-core/pull/57))

## v0.3.1 - 2018-12-23

### Changed

- Upgrade dependent packages to latest version, includes [Marpit v0.4.1](https://github.com/marp-team/marpit/releases/tag/v0.4.1) ([#55](https://github.com/marp-team/marp-core/pull/55))

## v0.3.0 - 2018-12-02

### Added

- Add `use` method from [Marpit v0.4.0](https://github.com/marp-team/marpit/releases/v0.4.0) ([#52](https://github.com/marp-team/marp-core/pull/52))

### Fixed

- Fix incorrect accessibility of members in `Marp` ([#51](https://github.com/marp-team/marp-core/pull/51), [#53](https://github.com/marp-team/marp-core/pull/53))

### Changed

- Upgrade Node and dependent packages to latest version ([#52](https://github.com/marp-team/marp-core/pull/52))
- Run `yarn audit` while running CI / publish processes ([#52](https://github.com/marp-team/marp-core/pull/52))

## v0.2.1 - 2018-11-24

### Security

- Upgrade dependent packages to prevent the malicious attack in dependencies ([#50](https://github.com/marp-team/marp-core/pull/50))

## v0.2.0 - 2018-11-21

### Added

- Support the scoped inline style through `<style scoped>` from [Marpit v0.3.0](https://github.com/marp-team/marpit/releases/v0.3.0) ([#49](https://github.com/marp-team/marp-core/pull/49))

### Fixed

- Fix double-bundling KaTeX by porting math parse logic from unmaintained [markdown-it-katex](https://github.com/waylonflinn/markdown-it-katex) ([#47](https://github.com/marp-team/marp-core/issues/47), [#48](https://github.com/marp-team/marp-core/pull/48))

### Changed

- Upgrade dependent packages to latest version ([#49](https://github.com/marp-team/marp-core/pull/49))

## v0.1.0 - 2018-11-06

### Breaking

- No longer work with Node v6.14.2 and v6.14.3 ([#45](https://github.com/marp-team/marp-core/pull/45))

### Added

- Ready to allow contributing by adding [guideline for marp-core](./.github/CONTRIBUTING.md) ([#46](https://github.com/marp-team/marp-core/pull/46))

### Fixed

- Force reflow on updated fitting elements in Edge ([#43](https://github.com/marp-team/marp-core/pull/43))

### Changed

- Support Node 10.x and use its LTS for development ([#44](https://github.com/marp-team/marp-core/pull/44))
- Upgrade dependent packages to latest version ([#45](https://github.com/marp-team/marp-core/pull/45))

## v0.0.12 - 2018-10-13

### Added

- Support collecting HTML comments for presenter notes, from [Marpit v0.2.0](https://github.com/marp-team/marpit/releases/v0.2.0) ([#39](https://github.com/marp-team/marp-core/pull/39))
- Provide CJS version bundle for browser ([#41](https://github.com/marp-team/marp-core/pull/41))
- Add `observe` argument into functions for browser to allow controlling observation frames ([#41](https://github.com/marp-team/marp-core/pull/41))

### Fixed

- Add yarn resolutions to flatten katex to prevent double-bundling ([#40](https://github.com/marp-team/marp-core/pull/40))
- Prevent reflow by calling `setAttribute` in browser context only if value is updated ([#41](https://github.com/marp-team/marp-core/pull/41))

### Changed

- Update license author to marp-team ([#38](https://github.com/marp-team/marp-core/pull/38))
- Upgrade dependent packages to latest version ([#42](https://github.com/marp-team/marp-core/pull/42))

## v0.0.11 - 2018-10-09

### Fixed

- Fix fitting header regression with broken comment traversing ([#37](https://github.com/marp-team/marp-core/pull/37))

## v0.0.10 - 2018-10-05

### Added

- Add CI test against Node v6 Boron Maintenance LTS ([#35](https://github.com/marp-team/marp-core/pull/35))

### Changed

- Update code style to use `for-of` loop instead of iterate functions if possible ([#34](https://github.com/marp-team/marp-core/pull/34))
- Upgrade dependent packages to latest, includes [marp-team/marpit v0.1.3](https://github.com/marp-team/marpit/releases/tag/v0.1.3) ([#36](https://github.com/marp-team/marp-core/pull/36))

## v0.0.9 - 2018-09-20

### Changed

- Upgrade [marp-team/marpit v0.1.2](https://github.com/marp-team/marpit/releases/tag/v0.1.2) ([#33](https://github.com/marp-team/marp-core/pull/33))
- Upgrade dependent packages to latest, includes pinned [ts-jest v23.10.0](https://github.com/kulshekhar/ts-jest/releases/tag/v23.10.0) ([#33](https://github.com/marp-team/marp-core/pull/33))

## v0.0.8 - 2018-09-18

### Changed

- Upgrade dependent packages to latest, includes [marp-team/marpit v0.1.1](https://github.com/marp-team/marpit/releases/tag/v0.1.1) ([#32](https://github.com/marp-team/marp-core/pull/32))

## v0.0.7 - 2018-09-15

### Added

- Support auto scaling for math block ([#30](https://github.com/marp-team/marp-core/pull/30))

### Changed

- Upgrade Node LTS and dependent packages ([#31](https://github.com/marp-team/marp-core/pull/31))

## v0.0.6 - 2018-09-06

### Fixed

- Fix over-sanitized header and footer by updating [marp-team/marpit v0.0.15](https://github.com/marp-team/marpit/pull/66) ([#29](https://github.com/marp-team/marp-core/pull/29))

## v0.0.5 - 2018-09-02

### Added

- Support HTML allowlisting ([#26](https://github.com/marp-team/marp-core/pull/26))

### Fixed

- Apply color directive to heading of default theme ([#28](https://github.com/marp-team/marp-core/pull/28))

### Changed

- Use [rollup-plugin-terser](https://github.com/TrySound/rollup-plugin-terser) instead of rollup-plugin-uglify ([#27](https://github.com/marp-team/marp-core/pull/27))

## v0.0.4 - 2018-08-29

### Added

- Support auto scaling of code block and fence (for `default` / `gaia` theme) ([#23](https://github.com/marp-team/marp-core/pull/23), [#25](https://github.com/marp-team/marp-core/pull/25))

### Changed

- Upgrade dependencies to latest ([#24](https://github.com/marp-team/marp-core/pull/24))

## v0.0.3 - 2018-08-22

### Added

- Add a separated bundle of `Marp.ready()` for browser ([#21](https://github.com/marp-team/marp-core/pull/21))

### Fixed

- Fix fitting header's size on printing ([#22](https://github.com/marp-team/marp-core/pull/22))

## v0.0.2 - 2018-08-19

### Added

- Support fitting header ([#17](https://github.com/marp-team/marp-core/pull/17))
- Add `uncover` theme ([#18](https://github.com/marp-team/marp-core/pull/18))
- Add emoji support with twemoji ([#19](https://github.com/marp-team/marp-core/pull/19))

### Fixed

- Reduce bundle size by stopping to resolve dependencies ([#15](https://github.com/marp-team/marp-core/pull/15))

### Changed

- Upgrade dependencies to latest ([#16](https://github.com/marp-team/marp-core/pull/16))

## v0.0.1 - 2018-08-10

- Initial release.

</details>
