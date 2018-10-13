import fittingObserver from './fitting/observer'

export default function browser(observe = true): void {
  fittingObserver(observe)
}
