/* eslint-env jest */
module.exports = async () => {
  // Patch for Node 10
  if (!global.globalThis) global.globalThis = global
}
