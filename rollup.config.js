import autoprefixer from 'autoprefixer'
import path from 'path'
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
    external: ['@marp-team/marpit', 'postcss'],
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
        plugins: [autoprefixer()],
      }),
      !process.env.ROLLUP_WATCH && uglify({}, minify),
    ],
  },
]
