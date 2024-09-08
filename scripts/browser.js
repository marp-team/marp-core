import { browser } from '../src/browser'

const script = document.currentScript

browser(script ? script.getRootNode() : document)
