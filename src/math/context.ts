import type { MathOptionsInterface } from './math'

type MathContext = {
  /** Whether Markdown is using math syntax  */
  enabled: boolean

  /** Math options that have passed into Marp Core instance */
  options: MathOptionsInterface

  /** Whether Math plugin is processing in the context for current render */
  processing: boolean

  // Library specific contexts
  katexMacroContext: Record<string, string>
  mathjaxContext: any
}

const contextSymbol = Symbol('marp-math-context')

export const setMathContext = (
  target: any,
  setter: (current: MathContext) => MathContext
) => {
  if (!Object.prototype.hasOwnProperty.call(target, contextSymbol)) {
    Object.defineProperty(target, contextSymbol, { writable: true })
  }
  target[contextSymbol] = setter(target[contextSymbol])
}

export const getMathContext = (target: any): MathContext => ({
  ...target[contextSymbol],
})
