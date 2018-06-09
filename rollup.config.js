import autoprefixer from 'autoprefixer'
import typescript from 'typescript'
import typescriptPlugin from 'rollup-plugin-typescript'
import path from 'path'
import postcss from 'rollup-plugin-postcss'
import pkg from './package.json'

export default [
  {
    external: ['@marp-team/marpit'],
    input: `src/${path.basename(pkg.main, '.js')}.ts`,
    output: {
      name: 'marp-core',
      file: pkg.main,
      format: 'cjs',
    },
    plugins: [
      typescriptPlugin({ typescript }),
      postcss({
        inject: false,
        plugins: [autoprefixer()],
      }),
    ],
  },
]
