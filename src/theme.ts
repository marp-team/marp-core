import Marp from './marp'

export function getThemeMeta(marp: Marp, meta: string): string | undefined {
  const { lastGlobalDirectives } = marp as any
  const theme = lastGlobalDirectives ? lastGlobalDirectives.theme : undefined

  // FIXME: Follow imported meta
  return marp.themeSet.getThemeProp(theme, ['meta', meta])
}
