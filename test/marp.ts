import { Marpit } from '@marp-team/marpit'
import { Marp } from '../src/marp'

describe('Marp', () => {
  it('extends Marpit', () => expect(new Marp()).toBeInstanceOf(Marpit))

  describe('themeSet property', () => {
    const { themeSet } = new Marp()

    it('has default theme', () => {
      expect(themeSet.default).toBeTruthy()
      expect(themeSet.default).toBe(themeSet.get('default'))
    })
  })
})
