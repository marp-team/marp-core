# CLAUDE.md - AI Assistant Guide for Marp Core

This document provides comprehensive guidance for AI assistants working with the Marp Core codebase.

## Table of Contents

- [Project Overview](#project-overview)
- [Codebase Structure](#codebase-structure)
- [Development Workflow](#development-workflow)
- [Testing Conventions](#testing-conventions)
- [Build System](#build-system)
- [Plugin Architecture](#plugin-architecture)
- [Theme System](#theme-system)
- [Code Patterns & Conventions](#code-patterns--conventions)
- [Common Tasks](#common-tasks)
- [Important Considerations](#important-considerations)

---

## Project Overview

**Project:** `@marp-team/marp-core` v4.2.0
**Type:** Markdown-to-HTML presentation framework
**Language:** TypeScript
**License:** MIT
**Node Version:** >=18

### What is Marp Core?

Marp Core is the engine behind the Marp presentation ecosystem. It extends [Marpit](https://github.com/marp-team/marpit) framework with practical features:

- **Markdown Extensions**: Emoji, math typesetting (KaTeX/MathJax), syntax highlighting
- **Theme System**: Built-in themes (Default, Gaia, Uncover) with metadata-based configuration
- **Auto-scaling**: Fitting headers and auto-shrinking code blocks
- **Security**: HTML sanitization with allowlist system
- **Browser Support**: Web Components for interactive features

### Key Technologies

- **TypeScript** - Primary language
- **Rollup** - Build tool (ES modules → CommonJS/IIFE)
- **Jest** - Testing framework (95% coverage requirement)
- **Sass/SCSS** - Styling and themes
- **markdown-it** - Markdown parsing engine
- **PostCSS** - CSS transformation pipeline

---

## Codebase Structure

```
marp-core/
├── src/                          # Source code (~2,355 lines)
│   ├── marp.ts                   # Main Marp class (extends Marpit)
│   ├── browser.ts                # Browser-side API
│   ├── highlightjs.ts            # Syntax highlighting integration
│   ├── observer.ts               # SVG polyfill observer
│   │
│   ├── auto-scaling/             # Auto-scaling features
│   │   ├── index.ts              # Plugin export
│   │   ├── code-block.ts         # Code block auto-shrinking
│   │   ├── fitting-header.ts     # Fitting header (<!-- fit -->)
│   │   └── utils.ts              # Shared utilities
│   │
│   ├── custom-elements/          # Web Components
│   │   ├── definitions.ts        # Custom element definitions
│   │   ├── postcss-plugin.ts     # PostCSS integration
│   │   └── browser/
│   │       ├── marp-custom-element.ts
│   │       └── marp-auto-scaling.ts
│   │
│   ├── emoji/                    # Emoji support
│   │   ├── emoji.ts              # Twemoji integration
│   │   └── twemoji.scss          # Emoji styles
│   │
│   ├── html/                     # HTML sanitization
│   │   ├── html.ts               # HTML plugin
│   │   └── allowlist.ts          # Tag/attribute allowlist
│   │
│   ├── math/                     # Math typesetting
│   │   ├── math.ts               # Main plugin
│   │   ├── katex.ts              # KaTeX integration
│   │   ├── mathjax.ts            # MathJax integration
│   │   ├── context.ts            # Rendering context
│   │   ├── katex.scss            # KaTeX styles
│   │   └── mathjax.scss          # MathJax styles
│   │
│   ├── script/                   # Browser script injection
│   │   ├── script.ts             # Script plugin
│   │   └── browser-script.ts     # Browser runtime
│   │
│   ├── size/                     # Slide size management
│   │   └── size.ts               # Size directive plugin
│   │
│   └── slug/                     # Heading slugification
│       └── slug.ts               # GitHub-style slug generation
│
├── test/                         # Test files (~2,252 lines)
│   ├── marp.ts                   # Main class tests
│   ├── browser.ts                # Browser API tests
│   ├── custom-elements/
│   ├── size/
│   ├── math/
│   ├── __snapshots__/            # Jest snapshots
│   └── _transformers/
│       └── sass.js               # SCSS transformer for Jest
│
├── themes/                       # Built-in themes
│   ├── default.scss              # Default theme (GitHub style)
│   ├── gaia.scss                 # Gaia theme
│   ├── uncover.scss              # Uncover theme
│   ├── assets/
│   ├── README.md                 # Theme documentation
│   └── example.md
│
├── scripts/                      # Build scripts
│   ├── browser.js                # Browser bundle entry
│   └── postcss-optimize-default-theme.mjs
│
├── sandbox/                      # Development sandbox
│
├── Configuration Files:
│   ├── package.json              # Dependencies, scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── rollup.config.mjs         # Build config
│   ├── jest.config.mjs           # Test config
│   ├── eslint.config.mjs         # Linting rules
│   ├── .stylelintrc.yml          # CSS linting
│   ├── marp.config.mjs           # Marp CLI config
│   └── .nvmrc                    # Node version (20)
│
└── Output (generated):
    ├── lib/                      # Compiled JavaScript
    └── types/                    # TypeScript declarations
```

### File Responsibilities

| File | Purpose | Lines |
|------|---------|-------|
| `src/marp.ts` | Main Marp class, plugin integration, options handling | 135 |
| `src/auto-scaling/` | Auto-scale code blocks and headers to fit slides | ~300 |
| `src/emoji/emoji.ts` | Convert emoji shortcodes/unicode to twemoji SVG | ~150 |
| `src/math/` | Math typesetting with KaTeX/MathJax | ~500 |
| `src/html/` | HTML sanitization and allowlist system | ~200 |
| `src/size/size.ts` | Size directive for slide dimensions | ~100 |
| `src/slug/slug.ts` | Auto-generate heading IDs (GitHub-style) | ~100 |
| `src/script/` | Inject browser script for interactive features | ~150 |

---

## Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install

# Ensure correct Node version (v20)
nvm use
```

### Development Commands

```bash
# Build the project (clean + rollup)
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Development server + watch
npm run sandbox

# Generate TypeScript declarations
npm run types

# Clean build artifacts
npm run clean
```

### Code Quality

```bash
# Run all checks (before commit)
npm run check:format      # Prettier formatting check
npm run check:ts          # TypeScript type checking
npm run check:audit       # npm audit

# Linting
npm run lint:js           # ESLint (JavaScript/TypeScript)
npm run lint:css          # stylelint (CSS/SCSS)

# Auto-format code
npm run format:write      # Format all files with Prettier
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage (95% minimum required)
npm run test:coverage

# Watch mode for TDD
npm test -- --watch
```

### Pre-publish Validation

The `npm run prepack` script runs automatically before publishing:

```bash
npm-run-all --parallel check:* lint:* test:coverage --parallel build types
```

All of these must pass for successful publication.

---

## Testing Conventions

### Framework: Jest + ts-jest

**Configuration**: `jest.config.mjs`

- Environment: Node.js (jsdom available for DOM testing)
- Coverage threshold: **95% line coverage** (enforced)
- Transformers:
  - TypeScript: ts-jest
  - SCSS: Custom transformer (`test/_transformers/sass.js`)

### Test File Organization

```
test/
├── marp.ts                    # Main Marp class tests
├── browser.ts                 # Browser API tests
├── custom-elements/browser.ts # Web Components tests
├── size/size.ts              # Size directive tests
├── math/katex.ts             # Math rendering tests
└── __snapshots__/            # Jest snapshot files
```

### Testing Patterns

#### 1. Setup and Mocking

```typescript
import { Marp } from '../src/marp'

// Mock external dependencies
jest.mock('../src/observer')

describe('Feature', () => {
  // Factory pattern for Marp instances
  const marp = (opts?) => new Marp(opts)

  afterEach(() => jest.restoreAllMocks())

  // Tests...
})
```

#### 2. HTML Parsing with Cheerio

```typescript
import { load } from 'cheerio'

it('should render correctly', () => {
  const { html } = marp().render('# Title')
  const $ = load(html)

  expect($('h1').text()).toBe('Title')
  expect($('section').length).toBe(1)
})
```

#### 3. Context-based Test Organization

Uses `jest-plugin-context` for nested describe blocks:

```typescript
import { context } from 'jest-plugin-context'

context('when emoji is enabled', () => {
  it('converts shortcodes', () => { /* ... */ })
})

context('when emoji is disabled', () => {
  it('keeps shortcodes as-is', () => { /* ... */ })
})
```

#### 4. Snapshot Testing

```typescript
it('matches snapshot', () => {
  const { html, css } = marp().render('# Slide')
  expect(html).toMatchSnapshot()
  expect(css).toMatchSnapshot()
})
```

### Coverage Requirements

- **Minimum**: 95% line coverage
- **Enforced**: CI/CD pipeline fails below threshold
- **Exceptions**: TypeScript declaration files (`*.d.ts`)

---

## Build System

### Rollup Configuration (`rollup.config.mjs`)

Marp Core uses Rollup for bundling with three separate builds:

#### 1. Main CommonJS Bundle

```javascript
// Input: src/marp.ts
// Output: lib/marp.js (CommonJS)
{
  input: 'src/marp.ts',
  output: { file: 'lib/marp.js', format: 'cjs' },
  plugins: [typescript(), postcss(), commonjs(), terser()]
}
```

#### 2. Browser CommonJS Bundle

```javascript
// Input: src/browser.ts
// Output: lib/browser.cjs.js (CommonJS for bundlers)
{
  input: 'src/browser.ts',
  output: { file: 'lib/browser.cjs.js', format: 'cjs' }
}
```

#### 3. Browser IIFE Bundle

```javascript
// Input: scripts/browser.js
// Output: lib/browser.js (Standalone script)
{
  input: 'scripts/browser.js',
  output: {
    file: 'lib/browser.js',
    format: 'iife',
    name: 'marpCoreBrowser'
  }
}
```

### Rollup Plugins

1. **@rollup/plugin-typescript**
   - Compiles TypeScript to JavaScript
   - Generates source maps

2. **rollup-plugin-postcss**
   - Processes SCSS files
   - Applies PostCSS transformations:
     - `autoprefixer` - Add vendor prefixes
     - `cssnano` - Minify CSS
     - `postcss-url` - Encode SVG as base64
     - `postcssOptimizeDefaultTheme` - Custom optimization

3. **@rollup/plugin-commonjs**
   - Convert CommonJS modules to ES modules

4. **@rollup/plugin-terser**
   - Minify JavaScript output

5. **@rollup/plugin-json**
   - Import JSON files

6. **@rollup/plugin-node-resolve**
   - Resolve node_modules dependencies

### TypeScript Configuration

**tsconfig.json:**

```json
{
  "extends": ["@tsconfig/recommended", "@tsconfig/node20"],
  "compilerOptions": {
    "noImplicitAny": false,      // Flexible typing
    "resolveJsonModule": true,   // Import JSON
    "rootDir": ".",
    "sourceMap": true,           // Enable debugging
    "isolatedModules": true      // Better compilation
  },
  "include": ["src"]
}
```

### Output Structure

```
lib/
├── marp.js              # Main CommonJS bundle
├── marp.js.map          # Source map
├── browser.cjs.js       # Browser CommonJS
├── browser.cjs.js.map   # Source map
├── browser.js           # Browser IIFE
└── browser.js.map       # Source map

types/
└── src/
    ├── marp.d.ts        # Type declarations
    └── ...              # All module declarations
```

---

## Plugin Architecture

Marp Core uses a **plugin-based architecture** where each feature is a modular plugin.

### Plugin Pattern

All plugins follow this structure:

```typescript
// src/feature/feature.ts

import marpitPlugin from '@marp-team/marpit/plugin'

// 1. Options interface
export interface FeatureOptions {
  enabled?: boolean
  // ... other options
}

// 2. CSS generator (optional)
export const css = (opts: FeatureOptions): string | undefined => {
  if (!opts.enabled) return undefined
  return '.some-css { ... }'
}

// 3. Markdown plugin (required)
export const markdown = marpitPlugin((md) => {
  // Access Marp instance
  const marpInstance = md.marpit

  // Add markdown-it rules
  md.core.ruler.after('inline', 'feature', (state) => {
    // Manipulate state.tokens
  })

  // Override renderers
  md.renderer.rules.feature = (tokens, idx) => {
    return '<custom-html>'
  }
})

// 4. PostCSS plugin (optional)
export const postcssPlugin = () => ({
  postcssPlugin: 'feature-postcss',
  Once(root) {
    // Transform CSS
  }
})
postcssPlugin.postcss = true
```

### Plugin Integration

In `src/marp.ts`:

```typescript
class Marp extends Marpit {
  constructor(opts) {
    super(opts)
    // Initialize plugins with options
  }

  protected applyMarkdownItPlugins(md) {
    super.applyMarkdownItPlugins(md)

    // Register plugins in order
    md.use(htmlPlugin.markdown, this.options.html)
      .use(emojiPlugin.markdown, this.options.emoji)
      .use(mathPlugin.markdown, this.options.math)
      .use(autoScalingPlugin.markdown)
      .use(sizePlugin.markdown)
      .use(scriptPlugin.markdown)
      .use(slugPlugin.markdown, this.options.slug)
  }

  protected themeSetPackOptions() {
    const options = super.themeSetPackOptions()

    // Inject plugin CSS
    options.before = [
      emojiPlugin.css(this.options.emoji),
      mathPlugin.css(this),
      ...options.before
    ].filter(Boolean)

    return options
  }
}
```

### Available Plugins

| Plugin | File | Purpose |
|--------|------|---------|
| **HTML** | `src/html/` | Sanitize HTML with allowlist |
| **Emoji** | `src/emoji/` | Convert emoji to twemoji SVG |
| **Math** | `src/math/` | Render math with KaTeX/MathJax |
| **Auto-scaling** | `src/auto-scaling/` | Fit headers and shrink code blocks |
| **Size** | `src/size/` | Handle size directive |
| **Script** | `src/script/` | Inject browser helper script |
| **Slug** | `src/slug/` | Generate heading IDs |
| **Syntax** | `src/highlightjs.ts` | Code syntax highlighting |

---

## Theme System

### Built-in Themes

Marp Core includes three official themes in `themes/`:

| Theme | File | Style | Use Case |
|-------|------|-------|----------|
| **Default** | `default.scss` | GitHub Markdown style | General purpose, clean documentation |
| **Gaia** | `gaia.scss` | Modern, colorful | Presentations, visual impact |
| **Uncover** | `uncover.scss` | Minimal, simple | Modern minimalism |

### Theme Metadata

Themes use CSS comment metadata to configure features:

```scss
/**
 * @theme gaia
 * @auto-scaling fittingHeader,code
 * @size 4:3 960px 720px
 * @size 16:9 1280px 720px
 */
```

#### Metadata Keywords

- **`@theme [name]`** - Theme identifier
- **`@auto-scaling [features]`** - Enable auto-scaling
  - `true` - All features
  - `fittingHeader` - Fitting headers only
  - `code` - Code block shrinking
  - `math` - Math block shrinking
- **`@size [name] [width] [height]`** - Define size presets
  - Example: `@size 4:3 960px 720px`

### Theme Requirements

All built-in themes must:

1. **Support `invert` class** - Provides inverted color scheme (usually dark mode)
2. **Define size presets** - At least `4:3` and `16:9`
3. **Use CSS custom properties** - For easy customization
4. **Support auto-scaling** - Enable `@auto-scaling` metadata

### Theme Color System

Themes use CSS custom properties for colors:

```scss
section {
  --color-fg-default: #24292f;
  --color-canvas-default: #ffffff;
  --color-highlight: #0969da;
  --color-link: #0969da;

  background-color: var(--color-canvas-default);
  color: var(--color-fg-default);
}

section.invert {
  --color-fg-default: #ffffff;
  --color-canvas-default: #24292f;
}
```

### Creating Custom Themes

Users can create custom themes by:

1. **Extending existing themes**:
   ```scss
   @import '@marp-team/marp-core/themes/default';

   section {
     --color-highlight: #ff6b6b;
   }
   ```

2. **Defining new themes**:
   ```scss
   /**
    * @theme custom
    * @auto-scaling true
    * @size 16:9 1280px 720px
    */

   section {
     /* Theme styles */
   }
   ```

---

## Code Patterns & Conventions

### 1. Markdown-it Token Manipulation

Plugins manipulate tokens in the markdown-it pipeline:

```typescript
md.core.ruler.after('inline', 'plugin-name', (state) => {
  state.tokens.forEach((token, idx) => {
    if (token.type === 'inline') {
      // Process inline tokens
      token.children?.forEach((child, childIdx) => {
        if (child.type === 'text') {
          // Transform text
          const newToken = new Token('custom_type', '', 0)
          newToken.content = child.content
          token.children[childIdx] = newToken
        }
      })
    }
  })
})
```

### 2. Custom Renderer Rules

Override default HTML rendering:

```typescript
md.renderer.rules.custom_type = (tokens, idx) => {
  const token = tokens[idx]
  return `<custom-element>${token.content}</custom-element>`
}
```

### 3. Options Merging Pattern

```typescript
class Marp extends Marpit {
  constructor(opts: MarpOptions = {}) {
    // Merge with defaults
    const options = {
      emoji: { shortcode: 'twemoji', unicode: 'twemoji', ...opts.emoji },
      html: opts.html ?? Marp.html,
      math: opts.math ?? 'mathjax',
      minifyCSS: opts.minifyCSS ?? true,
      script: opts.script ?? true,
      slug: opts.slug ?? true,
      ...opts
    }

    super(options)
  }
}
```

### 4. Custom Directives

Add custom global directives:

```typescript
// In constructor
Object.defineProperty(this.customDirectives.global, 'size', {
  value: (size: string) => ({ size })
})
```

Usage in Markdown:

```markdown
---
size: 4:3
---
```

### 5. Theme Metadata Access

```typescript
const autoScaling = this.themeSet.getThemeMeta(
  this.lastGlobalDirectives.theme,
  'auto-scaling'
)

if (autoScaling === 'true' || autoScaling?.includes('fittingHeader')) {
  // Enable fitting header
}
```

### 6. Web Components Pattern

```typescript
class MarpCustomElement extends HTMLElement {
  static get observedAttributes() {
    return ['data-attribute']
  }

  connectedCallback() {
    this._shadow = this.attachShadow({ mode: 'open' })
    this._update()
  }

  attributeChangedCallback() {
    this._update()
  }

  private _update() {
    // Update shadow DOM
  }
}

customElements.define('marp-custom', MarpCustomElement)
```

### 7. HTML Sanitization Pattern

```typescript
import { IWhiteList } from 'xss'

const allowlist: IWhiteList = {
  a: {
    href: (value) => value.startsWith('https://') ? value : '',
    target: true  // Allow any value
  },
  code: ['class'],  // Only allow class attribute
  span: []          // Allow tag but no attributes
}
```

### 8. PostCSS Plugin Pattern

```typescript
export const postcssPlugin = () => ({
  postcssPlugin: 'plugin-name',
  Once(root) {
    root.walkRules((rule) => {
      // Transform rules
    })
  },
  Declaration(decl) {
    // Transform declarations
  }
})

postcssPlugin.postcss = true  // Required
```

---

## Common Tasks

### Adding a New Feature Plugin

1. **Create plugin directory**:
   ```bash
   mkdir src/my-feature
   touch src/my-feature/index.ts
   ```

2. **Implement plugin pattern**:
   ```typescript
   // src/my-feature/index.ts
   import marpitPlugin from '@marp-team/marpit/plugin'

   export interface MyFeatureOptions {
     enabled?: boolean
   }

   export const css = (opts: MyFeatureOptions) => {
     if (!opts.enabled) return undefined
     return '.my-feature { ... }'
   }

   export const markdown = marpitPlugin((md) => {
     md.core.ruler.after('inline', 'my-feature', (state) => {
       // Transform tokens
     })
   })
   ```

3. **Integrate in Marp class** (`src/marp.ts`):
   ```typescript
   import * as myFeature from './my-feature'

   class Marp extends Marpit {
     constructor(opts: MarpOptions) {
       // Add to options
       this.options.myFeature = opts.myFeature ?? {}
     }

     protected applyMarkdownItPlugins(md) {
       super.applyMarkdownItPlugins(md)
       md.use(myFeature.markdown, this.options.myFeature)
     }

     protected themeSetPackOptions() {
       const options = super.themeSetPackOptions()
       options.before.push(myFeature.css(this.options.myFeature))
       return options
     }
   }
   ```

4. **Write tests** (`test/my-feature/index.ts`):
   ```typescript
   import { Marp } from '../../src/marp'

   describe('MyFeature', () => {
     const marp = (opts?) => new Marp(opts)

     it('should work', () => {
       const { html } = marp({ myFeature: { enabled: true } })
         .render('# Test')

       expect(html).toContain('expected-output')
     })
   })
   ```

5. **Update TypeScript types**:
   ```typescript
   // Add to MarpOptions interface
   export interface MarpOptions extends Options {
     myFeature?: MyFeatureOptions
   }
   ```

### Modifying an Existing Theme

1. **Locate theme file**: `themes/[theme-name].scss`

2. **Edit styles**:
   ```scss
   section {
     --new-variable: #value;

     .new-class {
       color: var(--new-variable);
     }
   }
   ```

3. **Test in sandbox**:
   ```bash
   npm run sandbox
   # Edit sandbox/slide.md to use theme
   ```

4. **Update theme metadata if needed**:
   ```scss
   /**
    * @theme gaia
    * @auto-scaling true
    * @size custom 1440px 900px  /* New size */
    */
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

### Adding Tests

1. **Create test file**: `test/feature/feature.ts`

2. **Follow pattern**:
   ```typescript
   import { Marp } from '../../src/marp'
   import { load } from 'cheerio'

   describe('Feature', () => {
     const marp = (opts?) => new Marp(opts)

     afterEach(() => jest.restoreAllMocks())

     it('should render correctly', () => {
       const { html, css } = marp().render('# Test')
       const $ = load(html)

       expect($('h1').text()).toBe('Test')
     })

     it('should match snapshot', () => {
       const result = marp().render('# Test')
       expect(result.html).toMatchSnapshot()
     })
   })
   ```

3. **Run tests**:
   ```bash
   npm test -- test/feature/feature.ts
   ```

4. **Check coverage**:
   ```bash
   npm run test:coverage
   ```

### Updating Dependencies

1. **Check for updates**:
   ```bash
   npx npm-check-updates
   ```

2. **Update dependencies**:
   ```bash
   npx npm-check-updates -u
   npm install
   ```

3. **Run full test suite**:
   ```bash
   npm run prepack  # All checks + tests + build
   ```

4. **Commit changes**:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: update dependencies"
   ```

### Creating a Release

1. **Ensure clean state**:
   ```bash
   git status  # Should be clean
   ```

2. **Run pre-version checks** (automatic):
   ```bash
   npm version [major|minor|patch]
   # Runs: preversion → version → postversion
   ```

3. **Push with tags**:
   ```bash
   git push -u origin <branch-name>
   git push --tags
   ```

4. **GitHub Actions will**:
   - Build release artifacts
   - Create GitHub release
   - Publish to npm

---

## Important Considerations

### 1. Security

**HTML Sanitization is Critical**

- All HTML input must go through the allowlist system
- Never disable sanitization in production
- Be cautious when adding new allowed tags/attributes
- Use XSS library for sanitization logic

**Location**: `src/html/allowlist.ts`

```typescript
// Safe pattern
allowlist.a = {
  href: (value) => value.startsWith('https://') ? value : '',
  target: true
}

// Unsafe - don't do this!
allowlist.script = []  // Never allow script tags
```

### 2. Performance

**Auto-scaling has Performance Cost**

- Uses SVG manipulation and DOM measurement
- Only enable for elements that need it
- Theme authors control via `@auto-scaling` metadata

**Optimization Strategies**:
- Minify CSS (enabled by default via `minifyCSS` option)
- Use CDN for external resources (math fonts, twemoji)
- Lazy-load heavy dependencies

### 3. Browser Compatibility

**Web Components Require Polyfills**

- Custom elements use Shadow DOM
- SVG polyfill required for older browsers
- Script injection handles polyfill loading

**Browser Script**: `src/script/browser-script.ts`

### 4. Markdown-it Integration

**Order Matters**

Plugins must be applied in correct order:

1. HTML sanitization (first)
2. Emoji conversion
3. Math typesetting
4. Auto-scaling
5. Size directives
6. Script injection
7. Slug generation (last)

**Location**: `src/marp.ts` → `applyMarkdownItPlugins()`

### 5. Theme Compatibility

**Breaking Theme Changes**

When modifying theme CSS:
- Test all three built-in themes
- Ensure `invert` class still works
- Verify size presets work correctly
- Check auto-scaling features

**Test Command**:
```bash
npm run sandbox
# Switch themes in sandbox/slide.md
```

### 6. TypeScript Strictness

**`noImplicitAny: false`**

The codebase allows implicit any for flexibility. However:
- Prefer explicit types where possible
- Use interfaces for public APIs
- Document complex types with JSDoc

### 7. Testing Requirements

**95% Coverage is Mandatory**

- CI/CD fails below 95% line coverage
- Add tests for all new features
- Update snapshots when output changes

**Update Snapshots**:
```bash
npm test -- -u
```

### 8. CSS Processing

**SCSS to CSS Pipeline**

1. Sass compilation
2. PostCSS transformations:
   - Autoprefixer (vendor prefixes)
   - URL rewriting (base64 SVG)
   - Minification (cssnano)
   - Custom optimizations

**Custom PostCSS Plugins**:
- `postcss-optimize-default-theme.mjs` - Optimizes default theme

### 9. Versioning

**Semantic Versioning**

- **Major**: Breaking API changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

**CHANGELOG.md** is auto-updated via version script.

### 10. Contributing

**Before Contributing**:

1. Read [CONTRIBUTING.md](.github/CONTRIBUTING.md)
2. Read [Marp team guidelines](https://github.com/marp-team/.github/blob/master/CONTRIBUTING.md)
3. Ensure all tests pass
4. Follow existing code patterns
5. Update documentation if needed

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run sandbox          # Dev server + watch
npm run watch           # Watch mode only
npm run build           # Production build

# Testing
npm test                # Run all tests
npm run test:coverage   # With coverage report

# Code Quality
npm run check:format    # Check formatting
npm run check:ts        # Type checking
npm run lint:js         # ESLint
npm run lint:css        # stylelint
npm run format:write    # Auto-format

# Complete Validation
npm run prepack         # All checks + tests + build
```

### File Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| `src/*/index.ts` | Plugin root | Main plugin export |
| `src/*/*.scss` | Plugin styles | Plugin-specific CSS |
| `test/*.ts` | Test files | Main test suites |
| `test/__snapshots__/*.snap` | Snapshot files | Jest snapshots |
| `themes/*.scss` | Theme files | Built-in themes |

### Key Interfaces

```typescript
// Main Marp class
class Marp extends Marpit {
  constructor(options?: MarpOptions)
  render(markdown: string): { html: string; css: string }
}

// Options
interface MarpOptions extends Options {
  html?: boolean | HTMLAllowList
  emoji?: EmojiOptions
  math?: boolean | 'mathjax' | 'katex' | MathOptions
  minifyCSS?: boolean
  script?: boolean | ScriptOptions
  slug?: boolean | SlugOptions
}

// Plugin pattern
interface Plugin {
  css?: (opts: any) => string | undefined
  markdown: MarkdownItPlugin
  postcssPlugin?: () => PostCSSPlugin
}
```

### Common Imports

```typescript
// Main class
import { Marp } from '@marp-team/marp-core'

// Plugin development
import marpitPlugin from '@marp-team/marpit/plugin'
import { MarkdownIt } from 'markdown-it'

// Testing
import { load } from 'cheerio'
import { context } from 'jest-plugin-context'
```

---

## Resources

- **Official Documentation**: https://marpit.marp.app
- **Marpit Framework**: https://github.com/marp-team/marpit
- **Marp CLI**: https://github.com/marp-team/marp-cli
- **Contributing Guide**: https://github.com/marp-team/.github/blob/master/CONTRIBUTING.md
- **markdown-it**: https://markdown-it.github.io
- **Rollup**: https://rollupjs.org
- **Jest**: https://jestjs.io

---

## Summary for AI Assistants

When working with Marp Core:

1. ✅ **Always run tests** before and after changes
2. ✅ **Follow plugin patterns** for consistency
3. ✅ **Maintain 95% coverage** - it's required
4. ✅ **Use existing patterns** - don't reinvent
5. ✅ **Test all themes** when changing theme system
6. ✅ **Security first** - sanitize HTML properly
7. ✅ **Check TypeScript types** - run `npm run check:ts`
8. ✅ **Format code** - run `npm run format:write`
9. ✅ **Update snapshots** when output changes intentionally
10. ✅ **Read existing code** - patterns are consistent

**Most Common Tasks**:
- Adding features → Create plugin in `src/[feature]/`
- Fixing bugs → Add test, fix code, verify test passes
- Updating themes → Edit `themes/[theme].scss`
- Adding tests → Follow patterns in `test/`

**Pre-commit Checklist**:
```bash
npm run check:format
npm run check:ts
npm run lint:js
npm run lint:css
npm test
npm run build
```

Or simply: `npm run prepack` (runs everything)

---

**Last Updated**: 2025-11-16
**Marp Core Version**: 4.2.0
