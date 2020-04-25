import { observe as marpitSVGPolyfill } from '@marp-team/marpit-svg-polyfill'
import { observer as fittingObserver } from './fitting-v2/observer/'

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

  marpitSVGPolyfill()
  fittingObserver()
}
