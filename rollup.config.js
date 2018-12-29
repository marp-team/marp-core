import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import path from 'path'
import postcssUrl from 'postcss-url'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript'
import pkg from './package.json'

const plugins = [
  json({ preferConst: true }),
  nodeResolve({ jsnext: true }),
  commonjs(),
  typescript({ resolveJsonModule: false }),
  postcss({
    inject: false,
    plugins: [
      postcssUrl({
        filter: '**/assets/**/*.svg',
        encodeType: 'base64',
        url: 'inline',
      }),
      autoprefixer(),
      cssnano({ preset: 'default' }),
    ],
  }),
  !process.env.ROLLUP_WATCH && terser(),
]

export default [
  {
    external: [...Object.keys(pkg.dependencies), 'markdown-it/lib/token'],
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: { exports: 'named', file: pkg.main, format: 'cjs' },
    plugins,
  },
  {
    input: 'browser.js',
    output: { file: pkg.marpBrowser, format: 'iife' },
    plugins,
  },
  {
    input: 'src/browser.ts',
    output: { file: 'lib/browser.cjs.js', format: 'cjs' },
    plugins,
  },
]
