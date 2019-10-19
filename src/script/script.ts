import { name, version } from '../../package.json'
import browserScript from './browser-script'
import Marp from '../marp'

interface ScriptOptionsInternal {
  nonce?: string
  source: 'inline' | 'cdn'
}

export interface ScriptOptions extends Partial<ScriptOptionsInternal> {}

const defaultOptions: ScriptOptionsInternal = { source: 'inline' }

export function markdown(md): void {
  const marp: Marp = md.marpit
  const opts = (() => {
    if (marp.options.script === false) return false
    if (marp.options.script === true) return defaultOptions

    return { ...defaultOptions, ...marp.options.script }
  })()

  md.core.ruler.before('marpit_collect', 'marp_core_script', state => {
    if (opts === false) return

    const lastSlideCloseIdxRev = [...state.tokens]
      .reverse()
      .findIndex(t => t.type === 'marpit_slide_close')

    if (lastSlideCloseIdxRev < 0) return

    // Inject script token to the last page
    const { Token } = state
    const scriptToken = new Token('marp_core_script', 'script', 0)

    scriptToken.block = true
    scriptToken.nesting = 0

    if (opts.source === 'inline') {
      scriptToken.content = browserScript
    } else if (opts.source === 'cdn') {
      scriptToken.attrSet(
        'src',
        `https://cdn.jsdelivr.net/npm/${name}@${version}/lib/browser.js`
      )

      // defer attribute would have no effect in inline script
      scriptToken.attrSet('defer', '')
    }

    if (opts.nonce) scriptToken.attrSet('nonce', opts.nonce)

    state.tokens.splice(-lastSlideCloseIdxRev - 1, 0, scriptToken)
  })

  md.renderer.rules.marp_core_script = (tokens, idx, _, __, self) => {
    const token = tokens[idx]
    return `<script${self.renderAttrs(token)}>${token.content || ''}</script>`
  }
}
