declare module '*.scss' {
  const scss: string
  export default scss
}

declare module '@marp-team/marpit/lib/markdown/marpit_plugin' {
  const marpitPlugin: <F extends (md: any, ...args: any[]) => void>(
    func: F
  ) => F
  export default marpitPlugin
}

declare module 'katex/package.json' {
  export const version: string
}
