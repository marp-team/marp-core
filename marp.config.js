const path = require('path')
const engine = path.join(__dirname, './lib/marp.js')

module.exports = {
  engine,
  server: true,
  inputDir: path.join(__dirname, './sandbox'),
  options: {
    minifyCSS: false,
  },
  html: true,
}
