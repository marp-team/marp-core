import type { MathOptionsInterface } from './math'

type MathContext = {
  enabled: boolean
  options: MathOptionsInterface

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
