import { langLoaders } from '../generated/shiki-lang-loaders'
import { setupShiki } from './shiki/setup'

export const shiki = setupShiki(langLoaders)
