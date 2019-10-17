import { polyfills } from '@marp-team/marpit-svg-polyfill'
import fittingObserver from './fitting/observer'

// Observer is divided for usage in Marp Web.
export function observer(keep = true): void {
  for (const polyfill of polyfills()) polyfill()
  fittingObserver()

  if (keep) window.requestAnimationFrame(() => observer(keep))
}

export default function browser(): void {
  if (typeof window === 'undefined') {
    throw new Error(
      "Marp Core's browser script is valid only in browser context."
    )
  }

  if (window['marpCoreBrowserScript']) {
    console.warn("Marp Core's browser script has already executed.")
    return
  }

  Object.defineProperty(window, 'marpCoreBrowserScript', { value: true })
  observer()
}
