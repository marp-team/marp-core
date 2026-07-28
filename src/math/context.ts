import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import type { Marp } from '../marp'
import type { MathOptionsInterface, MathLibrary } from './options'

export interface MathLibraryObject<Context> {
  /** CSS generator */
  css: (marp: Marp) => string | null

  /** markdown-it math block renderer rule generator */
  blockRenderer: (marp: Marp) => RenderRule

  /** markdown-it math inline renderer rule generator */
  inlineRenderer: (marp: Marp) => RenderRule

  /** Library specific context */
  context: Context

  /** Initial context setter */
  initializeContext?: (marp: Marp) => Context
}

export interface MathContext {
  /** Available math libraries */
  libs: Record<string, MathLibraryObject<unknown>>

  /** Whether Markdown is using math syntax  */
  enabled: boolean

  /** Math options that have passed into Marp Core instance */
  options: MathOptionsInterface

  /** Whether Math plugin is processing in the context for current render */
  processing: boolean
}

const contextKey = Symbol.for('marp-math-context')

const defaultMathContext = (): MathContext => ({
  libs: {},
  enabled: false,
  options: {},
  processing: false,
})

export const setMathContext = (
  target: object,
  setter: (current: MathContext) => MathContext,
) => {
  if (!Object.prototype.hasOwnProperty.call(target, contextKey)) {
    Object.defineProperty(target, contextKey, {
      writable: true,
      enumerable: false,
      value: defaultMathContext(),
    })
  }
  target[contextKey] = setter(target[contextKey])
}

export const getMathContext = (target: object): MathContext => ({
  ...(target[contextKey] ?? defaultMathContext()),
})

export const registerMathLibrary = (
  target: Marp,
  name: MathLibrary,
  lib: Omit<MathLibraryObject<unknown>, 'context'>,
) =>
  setMathContext(target, (ctx) => ({
    ...ctx,
    libs: {
      ...ctx.libs,
      [name]: { ...lib, context: lib.initializeContext?.(target) },
    },
  }))

export const getMathLibrary = (
  target: object,
  name?: MathLibrary,
): MathLibraryObject<unknown> | undefined => {
  const ctx = getMathContext(target)

  if (typeof name === 'string') return ctx.libs[name]
  if (typeof ctx.options.lib === 'string') return ctx.libs[ctx.options.lib]

  return undefined
}
