import autoprefixer from 'autoprefixer'
import path from 'path'
import postcssUrl from 'postcss-url'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript'
import pkg from './package.json'
import postcssOptimizeDefaultTheme from './scripts/postcss-optimize-default-theme'

const plugins = [
  json({ preferConst: true }),
  nodeResolve({ mainFields: ['module', 'jsnext:main', 'main'] }),
  commonjs(),
  typescript({ resolveJsonModule: false }),
  postcss({
    inject: false,
    minimize: {
      preset: [
        'default',
        {
          // Some minifers will apply on runtime to make debug easily.
          minifyParams: false,
          minifySelectors: false,
          normalizeWhitespace: false,
        },
      ],
    },
    plugins: [
      postcssOptimizeDefaultTheme(),
      postcssUrl({
        filter: '**/assets/**/*.svg',
        encodeType: 'base64',
        url: 'inline',
      }),
      autoprefixer(),
    ],
  }),
  !process.env.ROLLUP_WATCH && terser(),
]

export default [
  {
    input: 'browser.js',
    output: { file: 'lib/browser.js', format: 'iife' },
    plugins,
  },
  {
    input: 'src/browser.ts',
    output: { file: 'lib/browser.cjs.js', format: 'cjs' },
    plugins,
  },
  {
    external: Object.keys(pkg.dependencies),
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: { exports: 'named', file: pkg.main, format: 'cjs' },
    plugins,
  },
]
