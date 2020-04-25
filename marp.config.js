const path = require('path')
const engine = path.join(__dirname, './lib/marp.js')

module.exports = {
  engine,
  server: true,
  html: true,
  inputDir: path.join(__dirname, './sandbox'),
}
