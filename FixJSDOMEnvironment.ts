import JSDOMEnvironment from "jest-environment-jsdom";

// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // FIXME https://github.com/nodejs/node/issues/35889
    // Add missing importActual() function to mirror requireActual(),
    // which lets us work around the ESM bug.
    // Wrap the construction of the function in eval, so that transpilers
    // don't touch the import() call.
    this.global.importActual = eval("url => import(url)");
  }
}
