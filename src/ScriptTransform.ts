import * as esbuild from "esbuild-wasm";
import wasmURL from "../node_modules/esbuild-wasm/esbuild.wasm";

let resolved = false; //this is ugly but lets us skip awaiting a resolved promise
const initPromise = esbuild
  .initialize({
    wasmURL,
  })
  .then(() => (resolved = true));

export const transform: typeof esbuild.transform = async (input, options) => {
  if (!resolved) await initPromise;
  return esbuild.transform(input, options);
};
