import { createRequire } from 'node:module'
import path from 'node:path'
import url from 'node:url'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcssUrl from 'postcss-url'
import postcss from 'rollup-plugin-postcss'
import { string } from 'rollup-plugin-string'
import { NodePackageImporter } from 'sass'
import { postcssOptimizeDefaultTheme } from './scripts/postcss-optimize-default-theme.mjs'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const plugins = ({ browser = false } = {}) => [
  json({ preferConst: true }),
  alias({
    entries: [
      {
        find: /^.+browser-script$/,
        replacement: path.resolve(__dirname, 'lib/browser.js'),
      },
    ],
  }),
  string({ include: ['lib/*.js'] }),
  nodeResolve({ browser }),
  commonjs(),
  typescript(),
  postcss({
    inject: false,
    use: [
      [
        'sass',
        {
          pkgImporter: new NodePackageImporter(),
        },
      ],
    ],
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
            // Whitespace normalizer will apply on runtime  to make debug easily (minifyCSS option)
            normalizeWhitespace: false,
          },
        ],
      }),
    ],
  }),
  !process.env.ROLLUP_WATCH && terser(),
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

  // Main bundle
  {
    external: external(Object.keys(pkg.dependencies)),
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: { exports: 'named', file: pkg.main, format: 'cjs' },
    plugins: plugins(),
  },
]
