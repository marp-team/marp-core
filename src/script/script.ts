import browserScript from './browser-script'

export function markdown(md): void {
  md.core.ruler.before('marpit_collect', 'marp_core_script', state => {
    const lastSlideCloseIdxRev = [...state.tokens]
      .reverse()
      .findIndex(t => t.type === 'marpit_slide_close')

    if (lastSlideCloseIdxRev < 0) return

    // Inject script token to the last page
    const { Token } = state
    const scriptToken = new Token('marp_core_script', 'script', 0)

    scriptToken.block = true
    scriptToken.nesting = 0
    scriptToken.content = browserScript
    scriptToken.attrSet('defer', '')

    state.tokens.splice(-lastSlideCloseIdxRev - 1, 0, scriptToken)
  })

  md.renderer.rules.marp_core_script = (tokens, idx, _, __, self) => {
    const token = tokens[idx]
    return `<script${self.renderAttrs(token)}>${token.content || ''}</script>\n`
  }
}
