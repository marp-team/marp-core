import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssUrl from 'postcss-url'
import { NodePackageImporter } from 'sass-embedded'
import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }
import { postcssOptimizeDefaultTheme } from './scripts/postcss-optimize-default-theme.ts'
import { createRolldownChunkStringContext } from './scripts/rolldown-chunk-string-context-plugin.ts'

const { peerDependencies } = packageJson

const browserScriptContext = createRolldownChunkStringContext({
  name: 'marp-core-browser-script',
})

const baseConfig = {
  minify: true,
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
  inputOptions: {
    resolve: {
      alias: {
        // https://github.com/marp-team/marp-core/issues/436
        // https://github.com/jdecked/twemoji/issues/165
        '@twemoji/api': '@twemoji/api/dist/twemoji.esm.js',
      },
    },
  },
} as const satisfies UserConfig

const browserBaseConfig: UserConfig = {
  ...baseConfig,
  platform: 'browser',
  deps: { alwaysBundle: () => true },
}

const internalConfig: UserConfig = { ...baseConfig, dts: false }

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

  // Internals
  {
    ...internalConfig,
    entry: { 'internals/*': 'src/internals/*.ts' },
    format: ['esm', 'cjs'],
  },

  // Main bundle
  browserScriptContext.withTarget(
    {
      ...baseConfig,
      entry: {
        index: 'src/index.ts',
        full: 'src/full.ts',
        'plugins/*': 'src/plugins/*/index.ts',
      },
      format: ['esm', 'cjs'],
      deps: {
        ...baseConfig.deps,
        dts: {
          ...baseConfig.deps.dts,
          alwaysBundle: [
            ...baseConfig.deps.dts.alwaysBundle,
            ...Object.keys(peerDependencies),
          ],
        },
      },
    },
    { importSource: './browser-script' },
  ),
])
