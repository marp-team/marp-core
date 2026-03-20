import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssUrl from 'postcss-url'
import { NodePackageImporter } from 'sass-embedded'
import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'
import { postcssOptimizeDefaultTheme } from './scripts/postcss-optimize-default-theme.mjs'
import { createRolldownChunkStringContext } from './scripts/rolldown-chunk-string-context-plugin.ts'

const browserScriptContext = createRolldownChunkStringContext({
  name: 'marp-core-browser-script',
})

const baseConfig: UserConfig = {
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
          preset: [
            'default',
            {
              // Whitespace normalizer will apply on runtime to make debug easily (minifyCSS option)
              normalizeWhitespace: false,
            },
          ],
        }),
      ],
    },
    preprocessorOptions: {
      scss: {
        importers: [new NodePackageImporter()],
      },
    },
  },
}

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

  // Main bundle
  {
    ...baseConfig,
    name: 'Marp Core',
    entry: 'src/marp.ts',
    format: ['esm', 'cjs'],
    hooks: browserScriptContext.hooks,
    plugins: [
      browserScriptContext.targetPlugin({
        importSource: './browser-script',
      }),
    ],
  },
])
