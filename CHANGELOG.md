# Change Log

## [Unreleased]

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
- Support custom sanitizer for whitelisted HTML attributes ([#68](https://github.com/marp-team/marp-core/pull/68))
- Add usage of multiple classes in Gaia theme ([#69](https://github.com/marp-team/marp-core/pull/69))

### Fixed

- Fix over-sanitized attributes with HTML whitelist ([#68](https://github.com/marp-team/marp-core/pull/68))

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

---

<details><summary>History of pre-release versions</summary>

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

- Support HTML whitelisting ([#26](https://github.com/marp-team/marp-core/pull/26))

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
