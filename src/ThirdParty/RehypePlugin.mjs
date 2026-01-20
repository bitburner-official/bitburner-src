/**
 * We need to use a custom rehype plugin similar to rehype-mathjax. Specifically, we need to implement a function
 * similar to "createPlugin" in that library. That library depends on mathjax, which is what we want to get rid of at
 * runtime, so we copy only "create-plugin.js" from that library.
 *
 * The source code is retrieved from https://raw.githubusercontent.com/remarkjs/remark-math/76c14978ff6805011b8c56727c54104a511b9055/packages/rehype-mathjax/lib/create-plugin.js
 * The license is retrieved from https://raw.githubusercontent.com/remarkjs/remark-math/76c14978ff6805011b8c56727c54104a511b9055/license
 */

/**
(The MIT License)

Copyright (c) Junyoung Choi <fluke8259@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

/**
 * @import {ElementContent, Element, Root} from 'hast'
 * @import {VFile} from 'vfile'
 */

/**
 * @callback CreateRenderer
 *   Create a renderer.
 * @param {Readonly<Options>} options
 *   Configuration.
 * @returns {Renderer}
 *   Rendeder.
 *
 * @callback FormatError
 *   Format an error.
 * @param {any} jax
 *   MathJax object.
 * @param {any} error
 *   Error.
 * @returns {string}
 *   Formatted error.
 *
 * @typedef InputTexOptions
 *   Configuration for input tex math.
 *   <http://docs.mathjax.org/en/latest/options/input/tex.html#the-configuration-block>
 * @property {string | null | undefined} [baseURL]
 *   URL for use with links to tags, when there is a `<base>` tag in effect
 *   (optional).
 * @property {RegExp | null | undefined} [digits]
 *   Pattern for recognizing numbers (optional).
 * @property {ReadonlyArray<MathNotation> | null | undefined} [displayMath]
 *   Start/end delimiter pairs for display math (optional).
 * @property {FormatError | null | undefined} [formatError]
 *   Function called when TeX syntax errors occur (optional).
 * @property {ReadonlyArray<MathNotation> | null | undefined} [inlineMath]
 *   Start/end delimiter pairs for in-line math (optional).
 * @property {number | null | undefined} [maxBuffer]
 *   Max size for the internal TeX string (5K) (optional).
 * @property {number | null | undefined} [maxMacros]
 *   Max number of macro substitutions per expression (optional).
 * @property {ReadonlyArray<string> | null | undefined} [packages]
 *   Extensions to use (optional).
 * @property {boolean | null | undefined} [processEnvironments]
 *   Process `\begin{xxx}...\end{xxx}` outside math mode (optional).
 * @property {boolean | null | undefined} [processEscapes]
 *   Use `\$` to produce a literal dollar sign (optional).
 * @property {boolean | null | undefined} [processRefs]
 *   Process `\ref{...}` outside of math mode (optional).
 * @property {string | null | undefined} [tagIndent]
 *   Amount to indent tags (optional).
 * @property {'left' | 'right' | null | undefined} [tagSide]
 *   Side for `\tag` macros (optional).
 * @property {'all' | 'ams' | 'none' | null | undefined} [tags]
 *   Optional.
 * @property {boolean | null | undefined} [useLabelIds]
 *   Use label name rather than tag for ids (optional).
 *
 * @typedef {[open: string, close: string]} MathNotation
 *   Markers to use for math.
 *   See: <http://docs.mathjax.org/en/latest/options/input/tex.html#the-configuration-block>
 *
 * @typedef Options
 *   Configuration.
 *
 *   ###### Notes
 *
 *   When using `rehype-mathjax/browser`, only `options.tex.displayMath` and
 *   `options.tex.inlineMath` are used.
 *   That plugin will use the first delimiter pair in those fields to wrap
 *   math.
 *   Then you need to load MathJax yourself on the client and start it with the
 *   same markers.
 *   You can pass other options on the client.
 *
 *   When using `rehype-mathjax/chtml`, `options.chtml.fontURL` is required.
 *   For example:
 *
 *   ```js
 *     // …
 *     .use(rehypeMathjaxChtml, {
 *       chtml: {
 *         fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'
 *       }
 *     })
 *     // …
 *   ```
 * @property {Readonly<OutputChtmlOptions> | null | undefined} [chtml]
 *   Configuration for the output, when CHTML (optional).
 * @property {Readonly<OutputSvgOptions> | null | undefined} [svg]
 *   Configuration for the output, when SVG (optional).
 * @property {Readonly<InputTexOptions> | null | undefined} [tex]
 *   Configuration for the input TeX (optional).
 *
 * @typedef OutputChtmlOptions
 *   Configuration for output CHTML.
 *   <http://docs.mathjax.org/en/latest/options/output/chtml.html#the-configuration-block>
 * @property {boolean | null | undefined} [adaptiveCSS]
 *   `true` means only produce CSS that is used in the processed equations (optional).
 * @property {'center' | 'left' | 'right' | null | undefined} [displayAlign]
 *   Default for indentalign when set to `'auto'` (optional).
 * @property {string | null | undefined} [displayIndent]
 *   Default for indentshift when set to `'auto'` (optional).
 * @property {number | null | undefined} [exFactor]
 *   Default size of ex in em units (optional).
 * @property {string} fontURL
 *   The URL where the fonts are found (**required**).
 * @property {boolean | null | undefined} [matchFontHeight]
 *   `true` to match ex-height of surrounding font (optional).
 * @property {boolean | null | undefined} [mathmlSpacing]
 *   `true` for MathML spacing rules, false for TeX rules (optional).
 * @property {boolean | null | undefined} [merrorInheritFont]
 *   `true` to make merror text use surrounding font (optional).
 * @property {number | null | undefined} [minScale]
 *   Smallest scaling factor to use (optional).
 * @property {boolean | null | undefined} [mtextInheritFont]
 *   `true` to make mtext elements use surrounding font (optional).
 * @property {number | null | undefined} [scale]
 *   Global scaling factor for all expressions (optional).
 * @property {Readonly<Record<string, boolean>> | null | undefined} [skipAttributes]
 *   RFDa and other attributes NOT to copy to the output (optional).
 *
 * @typedef OutputSvgOptions
 *   Configuration for output SVG.
 *   <http://docs.mathjax.org/en/latest/options/output/svg.html#the-configuration-block>
 * @property {'center' | 'left' | 'right' | null | undefined} [displayAlign]
 *   Default for indentalign when set to `'auto'` (optional).
 * @property {string | null | undefined} [displayIndent]
 *   Default for indentshift when set to `'auto'` (optional).
 * @property {number | null | undefined} [exFactor]
 *   Default size of ex in em units (optional).
 * @property {'global' | 'local' | 'none' | null | undefined} [fontCache]
 *   Or `'global'` or `'none'` (optional).
 * @property {boolean | null | undefined} [internalSpeechTitles]
 *   Insert `<title>` tags with speech content (optional).
 * @property {string | null | undefined} [localID]
 *   ID to use for local font cache, for single equation processing (optional).
 * @property {boolean | null | undefined} [mathmlSpacing]
 *   `true` for MathML spacing rules, `false` for TeX rules (optional).
 * @property {boolean | null | undefined} [merrorInheritFont]
 *   `true` to make merror text use surrounding font (optional).
 * @property {number | null | undefined} [minScale]
 *   Smallest scaling factor to use (optional).
 * @property {boolean | null | undefined} [mtextInheritFont]
 *   `true` to make mtext elements use surrounding font (optional).
 * @property {number | null | undefined} [scale]
 *   Global scaling factor for all expressions (optional).
 * @property {Readonly<Record<string, boolean>> | null | undefined} [skipAttributes]
 *   RFDa and other attributes *not* to copy to the output (optional).
 * @property {number | null | undefined} [titleID]
 *   Initial ID number to use for `aria-labeledby` titles (optional).
 *
 * @callback Render
 *   Render a math node.
 * @param {string} value
 *   Math value.
 * @param {Readonly<RenderOptions>} options
 *   Configuration.
 * @returns {Array<ElementContent>}
 *   Content.
 *
 * @typedef RenderOptions
 *   Configuration.
 * @property {boolean} display
 *   Whether to render display math.
 *
 * @typedef Renderer
 *   Renderer.
 * @property {(() => undefined) | undefined} [register]
 *   Called before transform.
 * @property {(() => undefined) | undefined} [unregister]
 *   Called after transform.
 * @property {Render} render
 *   Render a math node.
 * @property {StyleSheet | undefined} [styleSheet]
 *   Render a style sheet (optional).
 *
 * @callback StyleSheet
 *   Render a style sheet.
 * @returns {Element}
 *   Style sheet.
 */

import { toText } from "hast-util-to-text";
import { SKIP, visitParents } from "unist-util-visit-parents";

/** @type {Readonly<Options>} */
const emptyOptions = {};
/** @type {ReadonlyArray<unknown>} */
const emptyClasses = [];

/**
 * Create a plugin.
 *
 * @param {CreateRenderer} createRenderer
 *   Create a renderer.
 * @returns
 *   Plugin.
 */
export function createPlugin(createRenderer) {
  /**
   * Plugin.
   *
   * @param {Readonly<Options> | null | undefined} [options]
   *   Configuration (optional).
   * @returns
   *   Transform.
   */
  return function (options) {
    /**
     * Transform.
     *
     * @param {Root} tree
     *   Tree.
     * @param {VFile} file
     *   File.
     * @returns {undefined}
     *   Nothing.
     */
    return function (tree, file) {
      const renderer = createRenderer(options || emptyOptions);
      let found = false;
      /** @type {Element | Root} */
      let context = tree;

      visitParents(tree, "element", function (element, parents) {
        const classes = Array.isArray(element.properties.className) ? element.properties.className : emptyClasses;
        // This class can be generated from markdown with ` ```math `.
        const languageMath = classes.includes("language-math");
        // This class is used by `remark-math` for flow math (block, `$$\nmath\n$$`).
        const mathDisplay = classes.includes("math-display");
        // This class is used by `remark-math` for text math (inline, `$math$`).
        const mathInline = classes.includes("math-inline");
        let display = mathDisplay;

        // Find `<head>`.
        if (element.tagName === "head") {
          context = element;
        }

        // Any class is fine.
        if (!languageMath && !mathDisplay && !mathInline) {
          return;
        }

        let parent = parents[parents.length - 1];
        let scope = element;

        // If this was generated with ` ```math `, replace the `<pre>` and use
        // display.
        if (
          element.tagName === "code" &&
          languageMath &&
          parent &&
          parent.type === "element" &&
          parent.tagName === "pre"
        ) {
          scope = parent;
          parent = parents[parents.length - 2];
          display = true;
        }

        /* c8 ignore next -- verbose to test. */
        if (!parent) return;

        if (!found && renderer.register) renderer.register();
        found = true;

        const text = toText(scope, { whitespace: "pre" });
        /** @type {Array<ElementContent> | undefined} */
        let result;

        try {
          result = renderer.render(text, { display });
        } catch (error) {
          // Print the error to the console to debug the issue easier.
          console.error(error);
          const cause = /** @type {Error} */ (error);

          file.message("Could not render math with mathjax", {
            ancestors: [...parents, element],
            cause,
            place: element.position,
            ruleId: "mathjax-error",
            source: "rehype-mathjax",
          });

          result = [
            {
              type: "element",
              tagName: "span",
              properties: {
                className: ["mathjax-error"],
                style: "color:#cc0000",
                title: String(cause),
              },
              children: [{ type: "text", value: text }],
            },
          ];
        }

        const index = parent.children.indexOf(scope);
        parent.children.splice(index, 1, ...result);
        return SKIP;
      });

      if (found) {
        if (renderer.styleSheet) context.children.push(renderer.styleSheet());
        if (renderer.unregister) renderer.unregister();
      }
    };
  };
}
