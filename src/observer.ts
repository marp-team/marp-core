import { polyfills } from '@marp-team/marpit-svg-polyfill'
import fittingObserver from './fitting/observer'

// Observer is divided for usage in Marp Web.
export default function observer(keep = true): void {
  for (const polyfill of polyfills()) polyfill()
  fittingObserver()

  if (keep) window.requestAnimationFrame(() => observer(keep))
}
