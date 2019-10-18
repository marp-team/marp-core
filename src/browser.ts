import observer from './observer'

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
