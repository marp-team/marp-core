# Contributing to Marp core

Thank you for taking the time to read how to contribute to Marp core! This is the guideline for contributing to Marp core.

But this document hardly has contents! We are following [**the contributing guideline of Marp team projects**](https://github.com/marp-team/.github/blob/master/CONTRIBUTING.md). _You have to read this before starting work._

## Development

```bash
# Build
npm run build

# Watch
npm run watch

# Watch with sandbox
npm run sandbox

# Output type definitions
npm run types
```

### Official theme

Marp core has some built-in official themes in `themes` folder. They should load when Marp class is initialized.

#### Requirements

- All of built-in theme have to support `invert` class. It provides an inverted color scheme from default color. Please also see [yhatt/marp#77](https://github.com/yhatt/marp/issues/77).
