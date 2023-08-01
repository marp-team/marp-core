import path from 'node:path'

const dirname = path.dirname(new URL(import.meta.url).pathname)

export default {
  engine: path.join(dirname, './lib/marp.js'),
  server: true,
  inputDir: path.join(dirname, './sandbox'),
  html: true,
  options: {
    minifyCSS: false,
  },
}
