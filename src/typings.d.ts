declare module '*?inline' {
  const source: string
  export default source
}

declare module 'katex/package.json' {
  export const version: string
}

declare module '#marp-shiki-plugin' {
  const shikiMarpCorePlugin: typeof import('./plugins/shiki').shikiMarpCorePlugin
  export default shikiMarpCorePlugin
}

declare module '#marp-shiki' {
  const shiki: typeof import('./internals/shiki').shiki
  export { shiki }
}

declare module '#marp-shiki-theme' {
  const name: typeof import('./internals/shiki-theme').name
  const theme: typeof import('./internals/shiki-theme').theme
  export { name, theme }
}
