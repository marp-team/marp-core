import { polyfills } from '@marp-team/marpit-svg-polyfill'
import fittingObserver from './fitting/observer'

export default function browser(observe = true): void {
  const observer = () => {
    for (const polyfill of polyfills()) polyfill()
    fittingObserver()

    if (observe) window.requestAnimationFrame(observer)
  }
  observer()
}
