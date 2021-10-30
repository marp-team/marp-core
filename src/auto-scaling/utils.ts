import type { Marp } from '../marp'

export const isEnabledAutoScaling = (marp: Marp, key?: string): boolean => {
  const directives: Marp['lastGlobalDirectives'] = (marp as any)
    .lastGlobalDirectives

  const theme = marp.themeSet.get((directives || {}).theme, true)
  const meta: string | undefined =
    theme && (marp.themeSet.getThemeMeta(theme, 'auto-scaling') as any)

  return !!(meta === 'true' || (key && (meta || '').includes(key)))
}
