# Contributing to Marp core

Thank you for taking the time to read how to contribute to Marp core! This is the guideline for contributing to Marp core.

But this document hardly has contents! We are following [the contributing guideline of marp-team projects](https://github.com/marp-team/marp/blob/master/.github/CONTRIBUTING.md). Please read these guidelines this before starting work in marp-core.

- [**Code of Conduct**](https://github.com/marp-team/marp/blob/master/.github/CODE_OF_CONDUCT.md)
- [**Report issue**](https://github.com/marp-team/marp/blob/master/.github/CONTRIBUTING.md#report-issue)
- [**Pull request**](https://github.com/marp-team/marp/blob/master/.github/CONTRIBUTING.md#pull-request)
- [**Release**](https://github.com/marp-team/marp/blob/master/.github/CONTRIBUTING.md#release)

## Development

```bash
# Build
yarn build

# Watch
yarn watch

# Output type definitions
yarn types
```

### Official theme

Marp core has some built-in official themes in `themes` folder. They should load when Marp class is initialized.

#### Requirements

- All of built-in theme have to support `invert` class. It provides an inverted color scheme from default color. Please also see [yhatt/marp#77](https://github.com/yhatt/marp/issues/77).
