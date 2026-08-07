/// <reference lib="dom" />

import { browser } from './browser'

const script = document.currentScript

browser(script ? (script.getRootNode() as Document | ShadowRoot) : document)
