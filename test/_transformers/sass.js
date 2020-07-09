const importer = require('node-sass-package-importer')()
const { renderSync } = require('sass')

module.exports = {
  process: (_, file) =>
    `module.exports = ${JSON.stringify(
      renderSync({ file, importer }).css.toString()
    )};`,
}
