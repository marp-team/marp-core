type ComputedStyleObserverTarget = {
  style: CSSStyleDeclaration
  props: Map<string, string | undefined>
}

export type ComputedStyleObserverEntry = {
  target: Element
  pseudoElt: string | undefined
  property: string
  value: string
}

export type ComputedStyleObserverCallback = (
  entries: ReadonlyArray<Readonly<ComputedStyleObserverEntry>>,
  observer: ComputedStyleObserver
) => void

export type ComputedStyleObserverInit = {
  properties: string[]
  pseudoElt?: string
}

export const computedStyle = (element: Element, pseudoElt?: string) => {
  // Use the top of window (The parent of rendering)
  // `window` may return empty style in the next view on the presenter note, exported through Marp CLI's bespoke template.
  const target = (document.defaultView || window).top
  return target.getComputedStyle(element, pseudoElt)
}

export class ComputedStyleObserver {
  private targets: Map<
    Element,
    Map<string, ComputedStyleObserverTarget>
  > = new Map()

  constructor(callback: ComputedStyleObserverCallback) {
    const frame = () => {
      const entires: ComputedStyleObserverEntry[] = []

      for (const [element, elmMap] of this.targets.entries()) {
        for (const [pseudoElt, { props, style }] of elmMap.entries()) {
          for (const [property, prevValue] of props.entries()) {
            const value = style.getPropertyValue(property)

            if (value !== prevValue) {
              props.set(property, value)

              if (prevValue !== undefined) {
                entires.push({
                  property,
                  value,
                  target: element,
                  pseudoElt: pseudoElt || undefined,
                })
              }
            }
          }
        }
      }

      if (entires.length > 0) callback(entires, this)

      window.requestAnimationFrame(frame)
    }
    window.requestAnimationFrame(frame)
  }

  observe(target: Element, options: ComputedStyleObserverInit): void {
    let elementMap = this.targets.get(target)
    if (!elementMap) {
      elementMap = new Map<string, ComputedStyleObserverTarget>()
      this.targets.set(target, elementMap)
    }

    const pseudoElt = options.pseudoElt || ''

    let targetObj = elementMap.get(pseudoElt)
    if (!targetObj) {
      targetObj = {
        style: computedStyle(target, options.pseudoElt),
        props: new Map<string, string>(),
      }
      elementMap.set(pseudoElt, targetObj)
    }

    for (const prop of options.properties) {
      if (!targetObj.props.has(prop)) targetObj.props.set(prop, undefined)
    }
  }

  unobserve(target: Element, pseudoElt?: string): void {
    this.targets.get(target)?.delete(pseudoElt || '')
  }

  disconnect(): void {
    this.targets.clear()
  }
}
