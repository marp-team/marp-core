import { Theme } from '@marp-team/marpit'
import marpitPlugin from '@marp-team/marpit/plugin'
import { Marp } from '../marp'

interface DefinedSize {
  width: string
  height: string
}

interface RestorableThemes {
  default: Theme | undefined
  themes: Set<Theme>
}

const sizePluginSymbol = Symbol('marp-size-plugin')

export const markdown = marpitPlugin((md) => {
  const marp: Marp = md.marpit
  const { render } = marp

  const definedSizes = (theme: Theme): ReadonlyMap<string, DefinedSize> => {
    const sizes = (marp.themeSet.getThemeMeta(theme, 'size') as string[]) || []
    const map = new Map<string, DefinedSize>()

    for (const value of sizes) {
      const args = value.split(/\s+/)

      if (args.length === 3) {
        map.set(args[0], { width: args[1], height: args[2] })
      } else if (args.length === 2 && args[1] === 'false') {
        map.delete(args[0])
      }
    }

    return map
  }

  const forRestore: RestorableThemes = {
    themes: new Set<Theme>(),
    default: undefined,
  }

  // Define `size` global directive
  Object.defineProperty(marp.customDirectives.global, 'size', {
    value: (size) => (typeof size === 'string' ? { size } : {}),
  })

  // Override render method to restore original theme set
  marp.render = (...args) => {
    try {
      return render.apply<Marp, any[], any>(marp, args)
    } finally {
      forRestore.themes.forEach((theme) => marp.themeSet.addTheme(theme))

      if (forRestore.default) marp.themeSet.default = forRestore.default
    }
  }

  md.core.ruler.after(
    'marpit_directives_global_parse',
    'marp_size',
    (state) => {
      if (state.inlineMode) return

      forRestore.themes.clear()
      forRestore.default = undefined

      const { theme, size } = (marp as any).lastGlobalDirectives
      if (!size) return

      const themeInstance = marp.themeSet.get(theme, true) as Theme
      const customSize = definedSizes(themeInstance).get(size)

      if (customSize) {
        state[sizePluginSymbol] = size

        const { width, height } = customSize
        const css = `${themeInstance.css}\nsection{width:${width};height:${height};}`

        const overrideTheme = Object.assign(new (Theme as any)(), {
          ...themeInstance,
          ...customSize,
          css,
        })

        forRestore.themes.add(themeInstance)

        if (themeInstance === marp.themeSet.default) {
          forRestore.default = themeInstance
          marp.themeSet.default = overrideTheme
        }

        if (marp.themeSet.has(overrideTheme.name)) {
          marp.themeSet.addTheme(overrideTheme)
        }
      }
    }
  )

  md.core.ruler.after('marpit_directives_apply', 'marp_size_apply', (state) => {
    if (state.inlineMode || !state[sizePluginSymbol]) return

    for (const token of state.tokens) {
      const { marpitDirectives } = token.meta || {}
      if (marpitDirectives) token.attrSet('data-size', state[sizePluginSymbol])
    }
  })

  md.core.ruler.after(
    'marpit_advanced_background',
    'marp_size_apply_advanced_background',
    (state) => {
      if (state.inlineMode || !state[sizePluginSymbol]) return

      for (const token of state.tokens) {
        if (token.type === 'marpit_advanced_pseudo_section_open') {
          token.attrSet('data-size', state[sizePluginSymbol])
        }
      }
    }
  )
})
