import { name, version } from '../../package.json'
import browserScript from './browser-script'
import Marp from '../marp'

interface ScriptOptionsInternal {
  nonce?: string
  source: 'inline' | 'cdn'
}

export interface ScriptOptions extends Partial<ScriptOptionsInternal> {}

const defaultOptions = { source: 'inline' } as const

export function markdown(md): void {
  const marp: Marp = md.marpit
  const opts = ((): false | ScriptOptionsInternal => {
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
    const token = state.tokens[state.tokens.length - lastSlideCloseIdxRev - 1]
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

    token.meta = token.meta || {}
    token.meta.marpCoreScriptTokens = token.meta.marpCoreScriptTokens || []
    token.meta.marpCoreScriptTokens.push(scriptToken)
  })

  const { marpit_slide_close } = md.renderer.rules

  md.renderer.rules.marpit_slide_close = (tokens, idx, opts, env, self) => {
    const renderer = marpit_slide_close || self.renderToken
    const original = renderer.call(self, tokens, idx, opts, env, self)

    // Append scripts
    const token = tokens[idx]

    if (token?.meta?.marpCoreScriptTokens) {
      return `${original}${token.meta.marpCoreScriptTokens
        .filter(t => t.type === 'marp_core_script')
        .map(t => `<script${self.renderAttrs(t)}>${t.content || ''}</script>`)
        .join('')}`
    }

    return original
  }
}
