import { browser } from '../src/browser' /* eslint-disable-line import-x/no-unresolved */

const script = document.currentScript

browser(script ? script.getRootNode() : document)
