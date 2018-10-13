# Change Log

## [Unreleased]

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
