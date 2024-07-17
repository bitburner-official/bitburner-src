import * as babel from "@babel/standalone";
import { transformSync, type ParserConfig } from "@swc/wasm-web";
import * as acorn from "acorn";
import { resolveScriptFilePath, validScriptExtensions, type ScriptFilePath } from "../Paths/ScriptFilePath";
import type { Script } from "../Script/Script";

// This is only for testing. It will be removed after we decide between Babel and SWC.
declare global {
  // eslint-disable-next-line no-var
  var forceBabelTransform: boolean;
}

export type AcornASTProgram = acorn.Program;
export type BabelASTProgram = object;
export type AST = AcornASTProgram | BabelASTProgram;

export enum FileType {
  PLAINTEXT,
  JSON,
  JS,
  JSX,
  TS,
  TSX,
  NS1,
}

export interface FileTypeFeature {
  isReact: boolean;
  isTypeScript: boolean;
}

export class ModuleResolutionError extends Error {}

const supportedFileTypes = [FileType.JSX, FileType.TS, FileType.TSX] as const;

export function getFileType(filename: string): FileType {
  const extension = filename.substring(filename.lastIndexOf(".") + 1);
  switch (extension) {
    case "txt":
      return FileType.PLAINTEXT;
    case "json":
      return FileType.JSON;
    case "js":
      return FileType.JS;
    case "jsx":
      return FileType.JSX;
    case "ts":
      return FileType.TS;
    case "tsx":
      return FileType.TSX;
    case "script":
      return FileType.NS1;
    default:
      throw new Error(`Invalid extension: ${extension}. Filename: ${filename}.`);
  }
}

export function getFileTypeFeature(fileType: FileType): FileTypeFeature {
  const result: FileTypeFeature = {
    isReact: false,
    isTypeScript: false,
  };
  if (fileType === FileType.JSX || fileType === FileType.TSX) {
    result.isReact = true;
  }
  if (fileType === FileType.TS || fileType === FileType.TSX) {
    result.isTypeScript = true;
  }
  return result;
}

export function parseAST(code: string, fileType: FileType): AST {
  const fileTypeFeature = getFileTypeFeature(fileType);
  let ast: AST;
  /**
   * acorn is much faster than babel-parser, especially when parsing many big JS files, so we use it to parse the AST of
   * JS code. babel-parser is only useful when we have to parse JSX and TypeScript.
   */
  if (fileType === FileType.JS) {
    ast = acorn.parse(code, { sourceType: "module", ecmaVersion: "latest" });
  } else {
    const plugins = [];
    if (fileTypeFeature.isReact) {
      plugins.push("jsx");
    }
    if (fileTypeFeature.isTypeScript) {
      plugins.push("typescript");
    }
    ast = babel.packages.parser.parse(code, {
      sourceType: "module",
      ecmaVersion: "latest",
      /**
       * The usage of the "estree" plugin is mandatory. We use acorn-walk to walk the AST. acorn-walk only supports the
       * ESTree AST format, but babel-parser uses the Babel AST format by default.
       */
      plugins: [["estree", { classFeatures: true }], ...plugins],
    }).program;
  }
  return ast;
}

/**
 * Simple module resolution algorithm:
 * - Try each extension in validScriptExtensions
 * - Return the first script found
 */
export function getModuleScript(
  moduleName: string,
  baseModule: ScriptFilePath,
  scripts: Map<ScriptFilePath, Script>,
): Script {
  let script;
  for (const extension of validScriptExtensions) {
    const filename = resolveScriptFilePath(moduleName, baseModule, extension);
    if (!filename) {
      throw new ModuleResolutionError(`Invalid module: "${moduleName}". Base module: "${baseModule}".`);
    }
    script = scripts.get(filename);
    if (script) {
      break;
    }
  }
  if (!script) {
    throw new ModuleResolutionError(`Invalid module: "${moduleName}". Base module: "${baseModule}".`);
  }
  return script;
}

/**
 * This function must be synchronous to avoid race conditions. Check https://github.com/bitburner-official/bitburner-src/pull/1173#issuecomment-2026940461
 * for more information.
 */
export function transformScript(
  script: Script,
  fileType: FileType,
): { scriptCode: string; sourceMap: object | undefined } {
  if (supportedFileTypes.every((v) => v !== fileType)) {
    throw new Error(`Invalid file type: ${fileType}`);
  }
  const fileTypeFeature = getFileTypeFeature(fileType);
  // This is only for testing. It will be removed after we decide between Babel and SWC.
  if (globalThis.forceBabelTransform) {
    const presets = [];
    if (fileTypeFeature.isReact) {
      presets.push("react");
    }
    if (fileTypeFeature.isTypeScript) {
      presets.push("typescript");
    }
    const result = babel.transform(script.code, {
      filename: script.filename,
      presets: presets,
      sourceMaps: true,
    });
    if (!result.code) {
      throw new Error(`Cannot transform script. Filename: ${script.filename}, server: ${script.server}.`);
    }
    return {
      scriptCode: result.code,
      sourceMap: result.map!,
    };
  } else {
    let parserConfig: ParserConfig;
    if (fileTypeFeature.isTypeScript) {
      parserConfig = {
        syntax: "typescript",
      };
      if (fileTypeFeature.isReact) {
        parserConfig.tsx = true;
      }
    } else {
      parserConfig = {
        syntax: "ecmascript",
      };
      if (fileTypeFeature.isReact) {
        parserConfig.jsx = true;
      }
    }
    const result = transformSync(script.code, {
      jsc: {
        parser: parserConfig,
        target: "es2020",
      },
      sourceMaps: true,
      sourceFileName: script.filename,
    });
    return { scriptCode: result.code, sourceMap: JSON.parse(result.map!) };
  }
}
