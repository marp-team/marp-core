import browserScript from './browser-string'

export function markdown(md): void {
  md.core.ruler.push('marp_core_script', state => {
    const { Token } = state
    const scriptToken = new Token('marp_core_script', 'script', 0)

    scriptToken.block = true
    scriptToken.nesting = 0
    scriptToken.content = browserScript
    scriptToken.attrSet('defer', '')

    state.tokens.push(scriptToken)
  })

  md.renderer.rules.marp_core_script = (tokens, idx, _, __, self) => {
    const token = tokens[idx]
    return `<script${self.renderAttrs(token)}>${token.content || ''}</script>\n`
  }
}
