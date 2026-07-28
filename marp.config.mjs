import path from 'node:path'

export default {
  engine: './lib/index.mjs',
  server: true,
  inputDir: path.join(
    path.dirname(new URL(import.meta.url).pathname),
    './sandbox',
  ),
  options: {
    minifyCSS: false,
  },
}
