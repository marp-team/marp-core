import { observe } from '@marp-team/marpit-svg-polyfill'

type ObserverOptions = {
  once?: boolean
  target?: ParentNode
}

export function observer({
  once = false,
  target = document,
}: ObserverOptions = {}): () => void {
  const cleanup = observe(target)

  if (once) {
    cleanup()

    return () => {
      /* no ops */
    }
  }

  return cleanup
}

export default observer
