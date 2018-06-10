/* tslint:disable: import-name */
import { Marpit } from '@marp-team/marpit'
import defaultTheme from '../themes/default.scss'
import gaiaTheme from '../themes/gaia.scss'

export class Marp extends Marpit {
  themeSet: any

  constructor(...args: any[]) {
    super(...args)

    this.themeSet.default = this.themeSet.add(defaultTheme)
    this.themeSet.add(gaiaTheme)
  }
}

export default Marp
