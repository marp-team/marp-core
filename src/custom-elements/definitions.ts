import type { View } from './type'

export const elements = {
  h1: {
    proto: (view: View) => view.HTMLHeadingElement,
    attrs: { role: 'heading', 'aria-level': '1' },
    style:
      'display: block; font-size: 2em; margin-block-start: 0.67em; margin-block-end: 0.67em; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;',
  },
  h2: {
    proto: (view: View) => view.HTMLHeadingElement,
    attrs: { role: 'heading', 'aria-level': '2' },
    style:
      'display: block; font-size: 1.5em; margin-block-start: 0.83em; margin-block-end: 0.83em; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;',
  },
  h3: {
    proto: (view: View) => view.HTMLHeadingElement,
    attrs: { role: 'heading', 'aria-level': '3' },
    style:
      'display: block; font-size: 1.17em; margin-block-start: 1em; margin-block-end: 1em; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;',
  },
  h4: {
    proto: (view: View) => view.HTMLHeadingElement,
    attrs: { role: 'heading', 'aria-level': '4' },
    style:
      'display: block; margin-block-start: 1.33em; margin-block-end: 1.33em; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;',
  },
  h5: {
    proto: (view: View) => view.HTMLHeadingElement,
    attrs: { role: 'heading', 'aria-level': '5' },
    style:
      'display: block; font-size: 0.83em; margin-block-start: 1.67em; margin-block-end: 1.67em; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;',
  },
  h6: {
    proto: (view: View) => view.HTMLHeadingElement,
    attrs: { role: 'heading', 'aria-level': '6' },
    style:
      'display: block; font-size: 0.67em; margin-block-start: 2.33em; margin-block-end: 2.33em; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;',
  },
  span: {
    proto: (view: View) => view.HTMLSpanElement,
  },

  // HTMLPreElement cannot attach shadow DOM by security reason
  pre: {
    proto: (view: View) => view.HTMLElement,
    style:
      'display: block; font-family: monospace; white-space: pre; margin: 1em 0; --marp-auto-scaling-white-space: pre;',
  },
} as const
