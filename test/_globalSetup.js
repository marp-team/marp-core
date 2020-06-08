module.exports = () => {
  // Workaround for JSDOM with Node 10
  // https://github.com/jsdom/jsdom/issues/2961
  const nodeMajor = Number.parseInt(process.version.slice(1).split('.')[0], 10)
  if (nodeMajor < 12) delete global.globalThis
}
