import marpitPlugin from '@marp-team/marpit/plugin'
import type { Marp } from '../marp'

export type Slugifier = (text: string) => string
export type PostSlugify = (slug: string, index: number) => string

export type SlugOptions = boolean | Slugifier | SlugOptionsObject

type SlugOptionsObject = {
  slugifier?: Slugifier
  postSlugify?: PostSlugify
}

const textTokenTypes = [
  'text',
  'code_inline',
  'image',
  'html_inline',
  'marp_emoji',
  'marp_unicode_emoji',
]

const defaultPostSlugify: PostSlugify = (slug, index) =>
  index > 0 ? `${slug}-${index}` : slug

const parseSlugOptions = (
  options: SlugOptions,
): false | Required<SlugOptionsObject> => {
  if (options === false) return false

  if (typeof options === 'function') {
    return { slugifier: options, postSlugify: defaultPostSlugify }
  }

  const defaultSlugOptions: Required<SlugOptionsObject> = {
    slugifier: githubSlugify,
    postSlugify: defaultPostSlugify,
  }

  return options === true
    ? defaultSlugOptions
    : { ...defaultSlugOptions, ...options }
}

export const markdown = marpitPlugin((md) => {
  const marp: Marp = md.marpit

  md.core.ruler.push('marp_slug', (state) => {
    const opts = parseSlugOptions(marp.options.slug ?? true)
    if (!opts) return

    const slugs = new Map<string, number>()

    for (const token of state.tokens) {
      if (token.type === 'marpit_slide_open') {
        const tokenId = token.attrGet('id')
        if (tokenId != null) slugs.set(tokenId, 0)
      }
    }

    let targetHeading
    let targetHeadingContents: any[] = []

    for (const token of state.tokens) {
      if (!targetHeading && token.type === 'heading_open') {
        targetHeading = token
        targetHeadingContents = []
      } else if (targetHeading) {
        if (token.type === 'heading_close') {
          let slug = token.attrGet('id')

          if (slug == null) {
            slug = opts.slugifier(
              targetHeadingContents
                .map((contentToken) => {
                  if (contentToken.type === 'inline') {
                    return contentToken.children
                      .map((t) => {
                        if (t.hidden) return ''
                        if (textTokenTypes.includes(t.type)) return t.content

                        return ''
                      })
                      .join('')
                  }

                  return ''
                })
                .join(''),
            )
          }

          const index = slugs.has(slug) ? slugs.get(slug)! + 1 : 0
          targetHeading.attrSet('id', opts.postSlugify(slug, index))

          slugs.set(slug, index)
          targetHeading = undefined
        } else if (!token.hidden) {
          targetHeadingContents.push(token)
        }
      }
    }
  })
})

// Convert given text to GitHub-style slug. This is compatible with Markdown language service.
export const githubSlugify: Slugifier = (text: string): string =>
  encodeURI(
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(
        /[\][!/'"#$%&()*+,./:;<=>?@\\^{|}~`。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝]/g,
        '',
      )
      .replace(/(?:^-+|-+$)/, ''),
  )
