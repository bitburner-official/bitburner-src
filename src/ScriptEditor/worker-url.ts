// Webpack has syntax for passing the URL of a script to be loaded in a web worker to
// various functions (such as `new Worker(...)`). However, since we just want the URL of
// the script, we tell webpack that in this module, `String(new URL(...))` should be
// treated as creating a web worker. That gives us access to the URL of the script,
// which we can pass to monaco.
const url = String(
  new URL(
    /* webpackChunkName: "custom-ts" */
    "./worker.ts",
    import.meta.url,
  ),
);
export default url;
