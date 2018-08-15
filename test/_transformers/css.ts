const { sep } = require('path')

module.exports = {
  process(src, filepath) {
    const ret = (str = src) => `module.exports = ${JSON.stringify(str)};`

    if (filepath.includes(`${sep}themes${sep}`)) {
      const [, themeName] = src.match(/@theme\s+(.+)$/m)
      return ret(`/* @theme ${themeName} */`)
    }

    return ret()
  },
}
