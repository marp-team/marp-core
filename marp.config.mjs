import path from 'node:path'

export default {
  engine: './lib/marp.js',
  server: true,
  inputDir: path.join(
    path.dirname(new URL(import.meta.url).pathname),
    './sandbox',
  ),
  html: true,
  options: {
    minifyCSS: false,
  },
}
