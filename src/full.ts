import { Marp as MarpBase } from './marp'
import mermaidPlugin from './plugins/mermaid'
import shikiPlugin from './plugins/shiki'

export class Marp extends MarpBase {
  constructor(...rest: ConstructorParameters<typeof MarpBase>) {
    super(...rest)

    this.use(shikiPlugin())
    this.use(mermaidPlugin())
  }
}

export type { MarpOptions } from './marp'
export default Marp
