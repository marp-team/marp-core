import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssUrl from 'postcss-url'
import { NodePackageImporter } from 'sass-embedded'
import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'
import { postcssOptimizeDefaultTheme } from './scripts/postcss-optimize-default-theme.ts'
import { createRolldownChunkStringContext } from './scripts/rolldown-chunk-string-context-plugin.ts'

const browserScriptContext = createRolldownChunkStringContext({
  name: 'marp-core-browser-script',
})

const baseConfig = {
  // minify: true,
  outDir: 'lib',
  outputOptions: { exports: 'named' },
  sourcemap: true,
  css: {
    target: false,
    transformer: 'postcss',
    postcss: {
      plugins: [
        postcssOptimizeDefaultTheme(),
        (postcssUrl as any)({
          filter: '**/assets/**/*.svg',
          encodeType: 'base64',
          url: 'inline',
        }),
        autoprefixer(),
        cssnano({
          // Whitespace normalizer will apply on runtime to make debug easily (minifyCSS option)
          preset: ['default', { normalizeWhitespace: false }],
        }),
      ],
    },
    preprocessorOptions: { scss: { importers: [new NodePackageImporter()] } },
  },
  deps: {
    neverBundle: /^#marp-/,
    dts: { alwaysBundle: ['markdown-it'] },
  },
  dts: { resolver: 'tsc' },
} as const satisfies UserConfig

const browserBaseConfig: UserConfig = {
  ...baseConfig,
  platform: 'browser',
  deps: { alwaysBundle: () => true },
}

export default defineConfig([
  // Browser helpers
  {
    ...browserBaseConfig,
    entry: 'src/browser-iife.ts',
    name: 'Browser script (iife)',
    outputOptions: { exports: 'none' },
    format: 'iife',
    plugins: [browserScriptContext.sourcePlugin()],
  },
  {
    ...browserBaseConfig,
    entry: 'src/browser.ts',
    name: 'Browser module',
    format: ['esm', 'cjs'],
  },

  // Internals (ESM only)
  {
    ...baseConfig,
    dts: false,
    entry: {
      'internals/*': ['src/internals/*.ts', '!src/internals/shiki-theme.ts'],
    },
    format: 'esm',
  },
  {
    ...baseConfig,
    dts: false,
    entry: { 'internals/shiki-theme': 'src/internals/shiki-theme.ts' },
    deps: { ...baseConfig.deps, alwaysBundle: () => true },
    format: 'esm',
  },

  // Plugins
  {
    ...baseConfig,
    name: 'Plugins',
    entry: { 'plugins/*': 'src/plugins/*/index.ts' },
    format: ['esm', 'cjs'],
  },

  // beautiful-mermaid ESM wrapper
  {
    ...baseConfig,
    dts: false,
    entry: { _beautifulMermaid: 'src/_beautiful-mermaid.ts' },
    name: 'beautiful-mermaid ESM wrapper',
    deps: { neverBundle: ['beautiful-mermaid'] },
    format: 'esm',
  },

  // Main bundle
  browserScriptContext.withTarget(
    {
      ...baseConfig,
      name: 'Marp Core',
      entry: ['src/index.ts', 'src/full.ts'],
      format: ['esm', 'cjs'],
      deps: {
        ...baseConfig.deps,
        dts: {
          ...baseConfig.deps.dts,
          alwaysBundle: [...baseConfig.deps.dts.alwaysBundle, 'shiki'],
        },
      },
    },
    { importSource: './browser-script' },
  ),
])
