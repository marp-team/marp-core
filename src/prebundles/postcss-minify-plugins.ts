import postcssMinifyParams from 'postcss-minify-params'
import postcssMinifySelectors from 'postcss-minify-selectors'
import postcssNormalizeWhitespace from 'postcss-normalize-whitespace'

export default [
  postcssNormalizeWhitespace,
  postcssMinifyParams,
  postcssMinifySelectors,
]
