import autoprefixer from 'autoprefixer'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from 'typescript'
import typescriptPlugin from 'rollup-plugin-typescript'
import path from 'path'
import postcss from 'rollup-plugin-postcss'
import pkg from './package.json'

export default [
  {
    external: ['@marp-team/marpit', 'postcss'],
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: {
      name: 'marp-core',
      file: pkg.main,
      format: 'cjs',
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
    ],
  },
]
