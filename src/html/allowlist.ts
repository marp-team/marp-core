export type HTMLAllowList = {
  [tag: string]:
    | string[]
    | { [attr: string]: boolean | ((value: string) => string) }
}

const globalAttrs = {
  class: true,
  dir: (value) => {
    const normalized = value.toLowerCase()
    return ['rtl', 'ltr', 'auto'].includes(normalized) ? normalized : ''
  },
  lang: true,
  title: true,
} as const satisfies HTMLAllowList[string]

const generateUrlSanitizer =
  (schemas: string[]) =>
  (value: string): string => {
    if (value.includes(':')) {
      // Check the URL schema if it exists
      const trimmed = value.trim().toLowerCase()
      const schema = trimmed.split(':', 1)[0]

      for (const allowedSchema of schemas) {
        if (schema === allowedSchema) return value
        if (allowedSchema.includes(':') && trimmed.startsWith(allowedSchema))
          return value
      }

      return ''
    }
    return value
  }

const webUrlSanitizer = generateUrlSanitizer(['http', 'https'])
const imageUrlSanitizer = generateUrlSanitizer(['http', 'https', 'data:image/'])
const srcSetSanitizer = (value: string): string => {
  for (const src of value.split(',')) {
    if (!imageUrlSanitizer(src)) return ''
  }
  return value
}

export const defaultHTMLAllowList = {
  a: {
    ...globalAttrs,
    href: webUrlSanitizer,
    name: true, // deprecated attribute, but still useful in Marp for making stable anchor link
    rel: true,
    target: true,
  },
  abbr: globalAttrs,
  address: globalAttrs,
  article: globalAttrs,
  aside: globalAttrs,
  audio: {
    ...globalAttrs,
    autoplay: true,
    controls: true,
    loop: true,
    muted: true,
    preload: true,
    src: webUrlSanitizer,
  },
  b: globalAttrs,
  bdi: globalAttrs,
  bdo: globalAttrs,
  big: globalAttrs,
  blockquote: {
    ...globalAttrs,
    cite: webUrlSanitizer,
  },
  br: globalAttrs,
  caption: globalAttrs,
  center: globalAttrs, // deprecated
  cite: globalAttrs,
  code: globalAttrs,
  col: {
    ...globalAttrs,
    align: true,
    valign: true,
    span: true,
    width: true,
  },
  colgroup: {
    ...globalAttrs,
    align: true,
    valign: true,
    span: true,
    width: true,
  },
  dd: globalAttrs,
  del: {
    ...globalAttrs,
    cite: webUrlSanitizer,
    datetime: true,
  },
  details: {
    ...globalAttrs,
    open: true,
  },
  div: globalAttrs,
  dl: globalAttrs,
  dt: globalAttrs,
  em: globalAttrs,
  figcaption: globalAttrs,
  figure: globalAttrs,
  // footer: globalAttrs, // Inserted by Marpit directives so disallowed to avoid confusion
  h1: globalAttrs,
  h2: globalAttrs,
  h3: globalAttrs,
  h4: globalAttrs,
  h5: globalAttrs,
  h6: globalAttrs,
  // header: globalAttrs, // Inserted by Marpit directives so disallowed to avoid confusion
  hr: globalAttrs,
  i: globalAttrs,
  img: {
    ...globalAttrs,
    align: true, // deprecated attribute, but still useful in Marp for aligning image
    alt: true,
    decoding: true,
    height: true,
    loading: true,
    src: imageUrlSanitizer,
    srcset: srcSetSanitizer,
    title: true,
    width: true,
  },
  ins: {
    ...globalAttrs,
    cite: webUrlSanitizer,
    datetime: true,
  },
  kbd: globalAttrs,
  li: {
    ...globalAttrs,
    type: true,
    value: true,
  },
  mark: globalAttrs,
  nav: globalAttrs,
  ol: {
    ...globalAttrs,
    reversed: true,
    start: true,
    type: true,
  },
  p: globalAttrs,
  picture: globalAttrs,
  pre: globalAttrs,
  source: {
    height: true,
    media: true,
    sizes: true,
    src: imageUrlSanitizer,
    srcset: srcSetSanitizer,
    type: true,
    width: true,
  },
  q: {
    ...globalAttrs,
    cite: webUrlSanitizer,
  },
  rp: globalAttrs,
  rt: globalAttrs,
  ruby: globalAttrs,
  s: globalAttrs,
  section: globalAttrs,
  small: globalAttrs,
  span: globalAttrs,
  sub: globalAttrs,
  summary: globalAttrs,
  sup: globalAttrs,
  strong: globalAttrs,
  strike: globalAttrs,
  table: {
    ...globalAttrs,
    width: true,
    border: true,
    align: true,
    valign: true,
  },
  tbody: {
    ...globalAttrs,
    align: true,
    valign: true,
  },
  td: {
    ...globalAttrs,
    width: true,
    rowspan: true,
    colspan: true,
    align: true,
    valign: true,
  },
  tfoot: {
    ...globalAttrs,
    align: true,
    valign: true,
  },
  th: {
    ...globalAttrs,
    width: true,
    rowspan: true,
    colspan: true,
    align: true,
    valign: true,
  },
  thead: {
    ...globalAttrs,
    align: true,
    valign: true,
  },
  time: {
    ...globalAttrs,
    datetime: true,
  },
  tr: {
    ...globalAttrs,
    rowspan: true,
    align: true,
    valign: true,
  },
  u: globalAttrs,
  ul: globalAttrs,
  video: {
    ...globalAttrs,
    autoplay: true,
    controls: true,
    loop: true,
    muted: true,
    playsinline: true,
    poster: imageUrlSanitizer,
    preload: true,
    src: webUrlSanitizer,
    height: true,
    width: true,
  },
  wbr: globalAttrs,
} as const satisfies HTMLAllowList
