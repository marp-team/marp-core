import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import path from 'path'
import postcssUrl from 'postcss-url'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import typescriptPlugin from 'rollup-plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'
import typescript from 'typescript'
import { minify } from 'uglify-es'
import pkg from './package.json'

export default [
  {
    external: Object.keys(pkg.dependencies),
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: {
      file: pkg.main,
      format: 'cjs',
      name: 'marp-core',
    },
    plugins: [
      json({ preferConst: true }),
      nodeResolve({ jsnext: true }),
      commonjs(),
      typescriptPlugin({
        resolveJsonModule: false, // JSON has already resolved by rollup-plugin-json
        typescript,
      }),
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
      !process.env.ROLLUP_WATCH && uglify({}, minify),
    ],
  },
]
