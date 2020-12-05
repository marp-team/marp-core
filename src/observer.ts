import { polyfills } from '@marp-team/marpit-svg-polyfill'
import fittingObserver from './fitting/observer'

type ObserverOptions = {
  once?: boolean
  target?: ParentNode
}

export function observer({
  once = false,
  target = document,
}: ObserverOptions = {}): () => void {
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
