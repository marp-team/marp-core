const { renderSync } = require('sass')
const { createImporter } = require('sass-extended-importer')

module.exports = {
  process: (_, file) => ({
    code: `module.exports = ${JSON.stringify(
      renderSync({ file, importer: createImporter() }).css.toString(),
    )};`,
  }),
}
