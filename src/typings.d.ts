declare module '*?inline' {
  const source: string
  export default source
}

declare module 'katex/package.json' {
  export const version: string
}

declare module '#marp-shiki' {
  const shiki: typeof import('./internals/shiki').shiki
  export { shiki }
}
