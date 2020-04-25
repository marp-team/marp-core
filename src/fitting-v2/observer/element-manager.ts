const findNodes = (
  list: Node[] | NodeList,
  cond: (node: Node) => boolean
): Node[] => {
  const nodes: Node[] = []

  for (const node of Array.from(list)) {
    if (cond(node)) nodes.push(node)
    nodes.push(...findNodes(node.childNodes, cond))
  }

  return nodes
}

export class ElementManager {
  readonly elements = new Set<Element>()

  onAdded?: (element: Element) => void
  onRemoved?: (element: Element) => void

  private observer?: MutationObserver

  constructor(private matcher: string) {}

  start(): Promise<void> {
    // document.body may be null when running observer while loading (e.g. <head>)
    if (document.readyState === 'loading') {
      return new Promise((resolved) =>
        document.addEventListener('DOMContentLoaded', () => {
          this.observe()
          resolved()
        })
      )
    }

    this.observe()
    return Promise.resolve()
  }

  private add(element: Element) {
    this.elements.add(element)
    this.onAdded?.(element)
  }

  private remove(element: Element) {
    this.elements.delete(element)
    this.onRemoved?.(element)
  }

  private observe() {
    document.querySelectorAll(this.matcher).forEach((elm) => this.add(elm))

    // Track add and remove matched element
    const isMatched = (node: Node) =>
      node.nodeType === 1 && (node as Element).matches(this.matcher)

    this.observer = new MutationObserver((mutations) => {
      for (const data of mutations) {
        for (const node of findNodes(data.removedNodes, isMatched)) {
          this.remove(node as Element)
        }
        for (const node of findNodes(data.addedNodes, isMatched)) {
          this.add(node as Element)
        }
      }
    })

    this.observer.observe(document.body, { childList: true, subtree: true })
  }
}
