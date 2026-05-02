import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { mathjax } from "@mathjax/src/js/mathjax.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import "@mathjax/src/js/util/asyncLoad/esm.js";

import { SerializedMmlVisitor } from "@mathjax/src/js/core/MmlTree/SerializedMmlVisitor.js";

import "@mathjax/src/js/input/tex/base/BaseConfiguration.js";
import "@mathjax/src/js/input/tex/ams/AmsConfiguration.js";
import "@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js";
import "@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js";

import xmlFormat from "xml-formatter";

export function walkDir(dir, callback) {
  if (!existsSync(dir)) {
    return;
  }
  console.log(`Processing ${dir}`);
  for (const file of readdirSync(dir).sort((a, b) => a.localeCompare(b, "en-US"))) {
    const filePath = join(dir, file);
    if (lstatSync(filePath).isDirectory()) {
      walkDir(filePath, callback);
      continue;
    }
    callback(filePath);
  }
}

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: ["base", "ams", "newcommand", "noundefined"],
  formatError(jax, err) {
    console.error(jax, err);
    process.exit(1);
  },
});
const visitor = new SerializedMmlVisitor();
const docMML = mathjax.document("", { InputJax: tex });

export function convertToMML(value) {
  const node = docMML.convert(value, {
    // Do not set "display" css property. The display mode will be decided by the rehype plugin.
    display: false,
  });
  node.walkTree((node) => {
    const attributes = node.attributes;
    // Remove unnecessary attributes.
    attributes.unset("data-latex");
    attributes.unset("data-latex-item");
  });
  const mathJaxOutput = visitor.visitTree(node, docMML);
  return xmlFormat.minify(mathJaxOutput, {
    filter: (node) => node.type !== "Comment",
    collapseContent: true,
  });
}
