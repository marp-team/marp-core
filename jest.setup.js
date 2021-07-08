module.exports = async () => {
  // For Node 10
  if (!global.globalThis) global.globalThis = global
}
