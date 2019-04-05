import Marp from './marp'

export function getThemeMeta(marp: Marp, meta: string): string | undefined {
  const { lastGlobalDirectives } = marp as any
  const theme = lastGlobalDirectives ? lastGlobalDirectives.theme : undefined

  return marp.themeSet.getThemeProp(theme, `meta.${meta}`)
}
