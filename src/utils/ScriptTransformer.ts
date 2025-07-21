import * as babel from "@babel/standalone";
import { transformSync, type ParserConfig } from "@swc/wasm-web";
import * as acorn from "acorn";
import { resolveScriptFilePath, validScriptExtensions, type ScriptFilePath } from "../Paths/ScriptFilePath";
import type { Script } from "../Script/Script";

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

export function parseAST(scriptName: string, hostname: string, code: string, fileType: FileType): AST {
  const fileTypeFeature = getFileTypeFeature(fileType);
  let ast: AST;
  try {
    /**
     * acorn is much faster than babel-parser, especially when parsing many big JS files, so we use it to parse the AST of
     * JS code. babel-parser is only useful when we have to parse JSX and TypeScript.
     */
    if (fileType === FileType.JS) {
      ast = acorn.parse(code, { sourceType: "module", ecmaVersion: "latest" });
    } else {
      const plugins: ("jsx" | "typescript")[] = [];
      if (fileTypeFeature.isReact) {
        plugins.push("jsx");
      }
      if (fileTypeFeature.isTypeScript) {
        plugins.push("typescript");
      }
      ast = babel.packages.parser.parse(code, {
        sourceType: "module",
        /**
         * The usage of the "estree" plugin is mandatory. We use acorn-walk to walk the AST. acorn-walk only supports the
         * ESTree AST format, but babel-parser uses the Babel AST format by default.
         */
        plugins: [["estree", { classFeatures: true }], ...plugins],
      }).program;
    }
  } catch (error) {
    /**
     * The message of syntax errors may be cryptic for players without programming experience. For example, some players
     * asked us what "Unexpected token" means. Therefore, we will catch the error here and provide a user-friendly error
     * message.
     */
    if (error instanceof SyntaxError) {
      let errorLocation = "unknown";
      /**
       * Some browsers (e.g., Firefox, Chrome) add the "loc" property to the error object. This property provides the
       * line and column numbers of the error.
       */
      if (
        "loc" in error &&
        error.loc &&
        typeof error.loc === "object" &&
        "line" in error.loc &&
        "column" in error.loc
      ) {
        errorLocation = `Line ${error.loc.line}, Column: ${error.loc.column}`;
      }
      throw new Error(
        `Syntax error in ${scriptName}, server: ${hostname}. Error location: ${errorLocation}. Error message: ${error.message}.`,
        {
          cause: error,
        },
      );
    } else {
      throw error;
    }
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
  code: string,
  fileType: FileType,
): { scriptCode: string; sourceMap: string | undefined } {
  if (supportedFileTypes.every((v) => v !== fileType)) {
    throw new Error(`Invalid file type: ${fileType}`);
  }
  const fileTypeFeature = getFileTypeFeature(fileType);
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
  const result = transformSync(code, {
    jsc: {
      parser: parserConfig,
      // @ts-expect-error -- jsc supports "esnext" target, but the definition in wasm-web.d.ts is outdated. Ref: https://github.com/swc-project/swc/issues/9495
      target: "esnext",
    },
    sourceMaps: true,
  });
  return {
    scriptCode: result.code,
    sourceMap: result.map,
  };
}
