const { compile, compileAsync, NodePackageImporter } = require('sass')

/** @type {import('sass').Options} */
const sassOptions = {
  importers: [new NodePackageImporter()],
}

const generateCode = (transformed) => ({
  code: `module.exports = ${JSON.stringify(transformed)};`,
})

module.exports = {
  processAsync: async (_, file) => {
    const transformed = await compileAsync(file, sassOptions)
    return generateCode(transformed.css)
  },
  process: (_, file) => {
    const transformed = compile(file, sassOptions)
    return generateCode(transformed.css)
  },
}
