import { applyCustomElements } from './custom-elements/browser'
import { observer } from './observer'

/**
 * @internal
 * @deprecated
 */
const exportedObserver = observer
export { exportedObserver as observer }

const marpCoreBrowserScript = Symbol()

export interface MarpCoreBrowser {
  /** Clean-up observer for applying polyfills. */
  (): void

  /** Clean-up observer for applying polyfills. */
  cleanup: () => void

  /**
   * Update DOMs to apply custom elements for Marp Core. It should call whenever
   * rendered DOMs rendered by Marp.
   *
   * It has exactly same meaning to call `browser()` with the same arguments
   * again.
   */
  update: () => MarpCoreBrowser
}

export const browser = (target: ParentNode = document): MarpCoreBrowser => {
  if (typeof window === 'undefined') {
    throw new Error(
      "Marp Core's browser script is valid only in browser context."
    )
  }

  applyCustomElements(target) // Should call in every update of Marp rendering

  if (target[marpCoreBrowserScript]) return target[marpCoreBrowserScript]

  const cleanupObserver = observer({ target })
  const cleanupFn = () => {
    cleanupObserver()
    delete target[marpCoreBrowserScript]
  }
  const cleanup = Object.assign(cleanupFn, {
    cleanup: cleanupFn,
    update: () => browser(target),
  })

  Object.defineProperty(target, marpCoreBrowserScript, {
    configurable: true,
    value: cleanup,
  })

  return cleanup
}

export default browser
