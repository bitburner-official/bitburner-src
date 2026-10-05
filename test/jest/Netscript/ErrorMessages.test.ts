import { SourceMapConsumer, type RawSourceMap } from "source-map-js";

import { Player } from "@player";

import { parseBlobUrlInMessage } from "../../../src/Netscript/ErrorMessages";
import { LoadedModule, type ScriptURL } from "../../../src/Script/LoadedModule";
import type { Script } from "../../../src/Script/Script";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { FileType, transformScript } from "../../../src/utils/ScriptTransformer";

import {
  fixDoImportIssue,
  getWorkerScriptAndNS,
  initGameEnvironment,
  setupBasicTestingEnvironment,
} from "../Utilities";

fixDoImportIssue();
initGameEnvironment();

beforeEach(() => {
  setupBasicTestingEnvironment();
});

const attachDependency = (filePath: ScriptFilePath, code: string, url: ScriptURL): Script => {
  const home = Player.getHomeComputer();
  home.writeToScriptFile(filePath, code);
  const script = home.scripts.get(filePath);
  if (!script) throw new Error(`Failed to write ${filePath}`);
  script.mod = new LoadedModule(url, Promise.resolve({}));
  return script;
};

// Compute a line and column number that lands on the throw statement in the compiled
// output, plus the source-map's expected mapping for that position
const findThrowMapping = (
  code: string,
  fileType: FileType,
): { generatedLine: number; generatedColumn: number; originalLine: number; originalColumn: number } => {
  const { scriptCode, sourceMap } = transformScript(code, fileType);
  const lines = scriptCode.split("\n");
  const throwLine = lines.find((line) => line.includes('throw new Error("bad")'));
  if (!throwLine || !sourceMap) throw new Error("SWC output was not what we expected");
  const generatedLine = lines.indexOf(throwLine) + 1;
  const generatedColumn = throwLine.indexOf("throw");
  const consumer = new SourceMapConsumer(JSON.parse(sourceMap) as RawSourceMap);
  const original = consumer.originalPositionFor({ line: generatedLine, column: generatedColumn });
  if (original.line == null || original.column == null)
    throw new Error("Source map did not resolve the throw statement");
  return { generatedLine, generatedColumn, originalLine: original.line, originalColumn: original.column };
};

describe("parseBlobUrlInMessage", () => {
  const url = "blob:https://example/abc" as ScriptURL;

  it("replaces a bare blob URL with the script filename", () => {
    const { ws } = getWorkerScriptAndNS();
    const script = attachDependency("helper.js" as ScriptFilePath, "export function foo() {}", url);
    ws.scriptRef.dependencies = new Map([[url, script]]);

    expect(parseBlobUrlInMessage(ws, `crash inside ${url}`)).toEqual(`crash inside ${script.filename}`);
  });

  it("replaces URL:line:col with filename:line:col for a plain JS script", () => {
    const { ws } = getWorkerScriptAndNS();
    const script = attachDependency("helper.js" as ScriptFilePath, "export function foo() {}", url);
    ws.scriptRef.dependencies = new Map([[url, script]]);

    // JS scripts have no source map, so positions pass through unchanged.
    expect(parseBlobUrlInMessage(ws, `at foo (${url}:5:10)`)).toEqual(`at foo (${script.filename}:5:10)`);
  });

  it("remaps positions back to the original TS source using the regenerated source map", () => {
    const { ws } = getWorkerScriptAndNS();
    const code = `type Ignored = number;\nexport function foo(): void {\n  throw new Error("bad");\n}\n`;
    const script = attachDependency("helper.ts" as ScriptFilePath, code, url);
    ws.scriptRef.dependencies = new Map([[url, script]]);

    const mapping = findThrowMapping(code, FileType.TS);
    expect(mapping.originalLine).not.toEqual(mapping.generatedLine);

    const result = parseBlobUrlInMessage(ws, `at foo (${url}:${mapping.generatedLine}:${mapping.generatedColumn})`);
    expect(result).toEqual(`at foo (${script.filename}:${mapping.originalLine}:${mapping.originalColumn})`);
  });

  it("remaps positions across TS-only syntax (comments, interfaces, type annotations, generics)", () => {
    const { ws } = getWorkerScriptAndNS();
    // Every line above the throw either gets stripped (comments, interface, type alias) or
    // rewritten with the TS syntax removed, so the throw ends up on a very different line
    // in the generated output than in the source.
    const code =
      `// A line comment that gets stripped by SWC.\n` +
      `/* A multi-line comment\n` +
      `   that spans multiple lines. */\n` +
      `interface Config {\n` +
      `  name: string;\n` +
      `  count: number;\n` +
      `}\n` +
      `type Alias<T> = T | null;\n` +
      `\n` +
      `export function foo<T extends Config>(cfg: T): Alias<string> {\n` +
      `  const label: string = cfg.name;\n` +
      `  throw new Error("bad");\n` +
      `  return label;\n` +
      `}\n`;
    const script = attachDependency("annotated.ts" as ScriptFilePath, code, url);
    ws.scriptRef.dependencies = new Map([[url, script]]);

    const mapping = findThrowMapping(code, FileType.TS);
    // Original throw is on line 12; anything that lands us back near that line is a real remap.
    expect(mapping.originalLine).toBeGreaterThan(mapping.generatedLine);
    expect(mapping.originalLine).toBeGreaterThanOrEqual(10);

    const result = parseBlobUrlInMessage(ws, `at foo (${url}:${mapping.generatedLine}:${mapping.generatedColumn})`);
    expect(result).toEqual(`at foo (${script.filename}:${mapping.originalLine}:${mapping.originalColumn})`);
  });

  it("remaps positions when the stack line uses the server/filename sourceURL instead of the blob URL", () => {
    // After a blob is loaded, browsers replace the blob URL in error.stack with the value from
    // the `//# sourceURL=server/filename` pragma. The remap has to recognize both forms.
    const { ws } = getWorkerScriptAndNS();
    const code =
      `// comment 1\n` +
      `\n` +
      `\n` +
      `// comment 2\n` +
      `export async function main(ns: NS) {\n` +
      `  await ns.hack("fake");\n` +
      `}\n`;
    const script = attachDependency("mainscript.ts" as ScriptFilePath, code, url);
    ws.scriptRef.dependencies = new Map([[url, script]]);

    const sourceURL = `${script.server}/${script.filename}`;
    const result = parseBlobUrlInMessage(ws, `at main (${sourceURL}:4:4)`);
    expect(result).toEqual(`at main (${script.filename}:6:2)`);
  });
});
