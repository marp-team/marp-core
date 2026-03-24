module.exports = {
  presets: [
    ['@babel/env', { targets: { node: 'current' } }],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ],
}
