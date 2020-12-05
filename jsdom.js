module.exports = process.version.startsWith('v10.')
  ? require('jest-environment-jsdom-fifteen')
  : require('jest-environment-jsdom')
