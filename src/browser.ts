import { applyCustomElements } from './custom-elements/browser'
import { observer } from './observer'
export { observer }

const marpCoreBrowserScript = Symbol()

export const browser = (target: ParentNode = document): (() => void) => {
  if (typeof window === 'undefined') {
    throw new Error(
      "Marp Core's browser script is valid only in browser context."
    )
  }

  if (target[marpCoreBrowserScript]) return target[marpCoreBrowserScript]

  // ---

  applyCustomElements(target)

  const cleanupObserver = observer({ target })
  const cleanup = () => {
    cleanupObserver()
    delete target[marpCoreBrowserScript]
  }

  Object.defineProperty(target, marpCoreBrowserScript, {
    configurable: true,
    value: cleanup,
  })

  return cleanup
}

export default browser
