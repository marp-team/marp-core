import path from 'path'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssUrl from 'postcss-url'
import postcss from 'rollup-plugin-postcss'
import { string } from 'rollup-plugin-string'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import postcssOptimizeDefaultTheme from './scripts/postcss-optimize-default-theme'

const plugins = ({ browser = false } = {}) => [
  json({ preferConst: true }),
  alias({
    entries: [
      {
        find: /^.+browser-script$/,
        replacement: path.resolve(__dirname, 'lib/browser.js'),
      },
      {
        find: /^.*prebundles[\\/]postcss-minify-plugins$/,
        replacement: path.resolve(__dirname, 'tmp/postcss-minify-plugins.mjs'),
      },
    ],
  }),
  string({ include: ['lib/*.js'] }),
  nodeResolve({ browser }),
  commonjs(),
  typescript(),
  postcss({
    inject: false,
    plugins: [
      postcssOptimizeDefaultTheme(),
      postcssUrl({
        filter: '**/assets/**/*.svg',
        encodeType: 'base64',
        url: 'inline',
      }),
      autoprefixer(),
      cssnano({
        preset: [
          'default',
          {
            // Some minifers will apply on runtime to make debug easily.
            minifyParams: false,
            minifySelectors: false,
            normalizeWhitespace: false,
          },
        ],
      }),
    ],
  }),
  !process.env.ROLLUP_WATCH && terser(),
]

const prebundlePlugins = () => [
  alias({
    entries: [
      {
        find: 'browserslist',
        replacement: path.resolve(
          __dirname,
          'src/prebundles/mocks/browserslist.ts'
        ),
      },
    ],
  }),
  ...plugins(),
  replace({ preventAssignment: true, __dirname: '""' }),
]

const external = (deps) => (id) =>
  deps.some((dep) => dep === id || id.startsWith(`${dep}/`))

export default [
  // Browser helpers
  {
    input: 'scripts/browser.js',
    output: { file: 'lib/browser.js', format: 'iife' },
    plugins: plugins({ browser: true }),
  },
  {
    input: 'src/browser.ts',
    output: { exports: 'named', file: 'lib/browser.cjs.js', format: 'cjs' },
    plugins: plugins({ browser: true }),
  },

  // Prebundles
  {
    input: `src/prebundles/postcss-minify-plugins.ts`,
    output: {
      exports: 'named',
      file: 'tmp/postcss-minify-plugins.mjs',
      format: 'es',
    },
    plugins: prebundlePlugins(),
  },

  // Main bundle
  {
    external: external(Object.keys(pkg.dependencies)),
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: { exports: 'named', file: pkg.main, format: 'cjs' },
    plugins: plugins(),
  },
]
