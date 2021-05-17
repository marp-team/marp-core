import path from 'path'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssUrl from 'postcss-url'
import postcss from 'rollup-plugin-postcss'
import { string } from 'rollup-plugin-string'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'
import postcssOptimizeDefaultTheme from './scripts/postcss-optimize-default-theme'

const plugins = [
  json({ preferConst: true }),
  nodeResolve({ mainFields: ['module', 'jsnext:main', 'main'] }),
  commonjs(),
  string({ include: ['lib/*.js'] }),
  alias({
    entries: [
      {
        find: /^.+browser-script$/,
        replacement: path.resolve(__dirname, './lib/browser.js'),
      },
    ],
  }),
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
      })
    ],
  }),
  !process.env.ROLLUP_WATCH && terser(),
]

const external = (deps) => (id) =>
  deps.some((dep) => dep === id || id.startsWith(`${dep}/`))

export default [
  {
    input: 'scripts/browser.js',
    output: { file: 'lib/browser.js', format: 'iife' },
    plugins,
  },
  {
    input: 'src/browser.ts',
    output: { exports: 'named', file: 'lib/browser.cjs.js', format: 'cjs' },
    plugins,
  },
  {
    external: external(Object.keys(pkg.dependencies)),
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: { exports: 'named', file: pkg.main, format: 'cjs' },
    plugins,
  },
]
