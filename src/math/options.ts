export type MathLibrary = (string & {}) | 'mathjax' | 'katex'

export interface MathOptionsInterface {
  lib?: MathLibrary

  /** @deprecated Use `options` parameter for KaTeX plugin instead */
  katexOption?: Record<string, unknown>

  /** @deprecated Use `fontPath` parameter for KaTeX plugin instead */
  katexFontPath?: string | false
}

interface NormalizedMathOptions extends MathOptionsInterface {
  lib: MathLibrary | undefined
}

export type MathOptions = boolean | MathLibrary | MathOptionsInterface

export const normalizeMathOptions = (
  opts: MathOptions | undefined,
): false | NormalizedMathOptions => {
  if (opts === false) return false
  if (typeof opts === 'string') return { lib: opts }
  if (typeof opts === 'object') return { lib: opts.lib, ...opts }

  return { lib: undefined }
}
