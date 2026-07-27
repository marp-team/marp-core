import { langLoaders } from '../generated/shiki-lang-lazy-loaders'
import { setupShiki } from './shiki/setup'

export const shiki = setupShiki(langLoaders)
