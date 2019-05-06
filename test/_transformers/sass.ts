const { renderSync } = require('sass')
const importer = require('node-sass-package-importer')()

module.exports = {
  process: (_, file) =>
    `module.exports = ${JSON.stringify(
      renderSync({ file, importer }).css.toString()
    )};`,
}
