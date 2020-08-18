import { polyfills } from '@marp-team/marpit-svg-polyfill'
import fittingObserver from './fitting/observer'

type ObserverOptions = {
  once?: boolean
  target?: ParentNode
}

export function observer(opts?: ObserverOptions): () => void
/** @deprecated Usage of observer() with boolean option has been deprecated. Please replace with the usage of option object. */
export function observer(keep?: boolean): () => void
export function observer(opts: ObserverOptions | boolean = {}): () => void {
  const _opts =
    typeof opts === 'boolean'
      ? ((keep): ObserverOptions => {
          const once = !keep
          console.warn(
            `[DEPRECATION WARNING] Usage of observer() with boolean option has been deprecated. Please replace with the usage of option object: observer({ once: ${
              once ? 'true' : 'false'
            } }).`
          )

          return { once }
        })(opts)
      : opts

  const { once = false, target = document } = _opts
  const polyfillFuncs = polyfills()

  let enabled = !once

  const observer = () => {
    for (const polyfill of polyfillFuncs) polyfill({ target })
    fittingObserver(target)

    if (enabled) window.requestAnimationFrame(observer)
  }
  observer()

  return () => {
    enabled = false
  }
}

export default observer
