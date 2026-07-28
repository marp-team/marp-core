import { Marp as MarpBase } from './marp'
import katexPlugin from './plugins/katex'
import mermaidPlugin from './plugins/mermaid'
import shikiPlugin from './plugins/shiki'

export class Marp extends MarpBase {
  constructor(...rest: ConstructorParameters<typeof MarpBase>) {
    super(...rest)

    this.use(katexPlugin())
    this.use(shikiPlugin())
    this.use(mermaidPlugin())
  }
}

export type { MarpOptions } from './marp'
export default Marp
