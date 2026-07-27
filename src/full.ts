import { Marp as MarpBase } from './marp'
import shikiPlugin from '#marp-shiki-plugin'

export class Marp extends MarpBase {
  constructor(...rest: ConstructorParameters<typeof MarpBase>) {
    super(...rest)

    this.markdown.use(shikiPlugin())
  }
}

export type { MarpOptions } from './marp'
export default Marp
