// postcss-minify-params is depending on browserslist to detect whether using
// IE. Marp does never use this detection so we will mock the module and return
// empty array. You can see the setting for pre-bundling in rollup.config.js.
export default () => []
