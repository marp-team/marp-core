declare module '*.css' {
  const css: string
  export default css
}

declare module '*.scss' {
  const scss: string
  export default scss
}

declare module 'katex/package.json' {
  export const version: string
}
