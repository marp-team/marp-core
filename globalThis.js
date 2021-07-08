// Shim for Node 10
if (!global.globalThis) {
  Object.defineProperty(global, 'globalThis', { value: global })
}
