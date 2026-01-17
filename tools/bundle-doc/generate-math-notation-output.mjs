import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { createPlugin } from "../../src/ThirdParty/RehypePlugin.mjs";
import { convertToMML, walkDir } from "./utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = {};
const parser = unified().use(remarkParse).use(remarkMath);
const tool = unified()
  .use(remarkRehype)
  .use(
    createPlugin(function () {
      return {
        render(value) {
          data[value] = convertToMML(value);
          return [];
        },
      };
    }),
  );

function processDir(dir) {
  walkDir(dir, (filePath) => {
    tool.runSync(parser.parse(readFileSync(filePath)));
  });
}

processDir(resolve(__dirname, "../../src/Documentation/doc/en"));

const notationInput = JSON.parse(readFileSync(resolve(__dirname, "../../src/Documentation/data/MathNotation.json")));
for (const value of Object.values(notationInput)) {
  data[value] = convertToMML(value);
}
console.log(`Generated MathML data for ${Object.keys(data).length} notation entries`);
writeFileSync(resolve(__dirname, "../../src/Documentation/data/MathNotationOutput.json"), JSON.stringify(data), {
  encoding: "utf-8",
});
