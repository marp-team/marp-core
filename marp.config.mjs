import path from 'node:path'

export default {
  engine: process.env.MARP_LIGHT ? './lib/index.mjs' : './lib/full.mjs',
  server: true,
  inputDir: path.join(
    path.dirname(new URL(import.meta.url).pathname),
    './sandbox',
  ),
  options: {
    minifyCSS: false,
  },
}
