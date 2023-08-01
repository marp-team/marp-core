import path from 'node:path'
import { Marp } from './lib/marp.js'

export default {
  engine: Marp,
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
