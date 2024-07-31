// `monaco` is available in the global scope, in the worker.

import type ts from "typescript/lib/typescript";

import {
  ScriptFilePath,
  allScriptExtensions,
  hasScriptExtension,
  isLegacyScript,
  resolveScriptFilePath,
  scriptExtensions,
} from "../Paths/ScriptFilePath";
import { type FilePath, asFilePath } from "../Paths/FilePath";

type TSWorkerClass = monaco.languages.typescript.TypeScriptWorker & {
  new (): TSWorkerClass;
  fileExists(path: string): boolean;
};
// From https://github.com/microsoft/monaco-editor/blob/v0.50.0/src/language/typescript/tsWorker.ts#L486C1-L492C2
interface CustomTSWebWorkerFactory {
  (
    TSWorkerClass: TSWorkerClass,
    tsc: typeof ts,
    libs: Record<string, string>,
  ): monaco.languages.typescript.TypeScriptWorker;
}

declare global {
  // This particular eslint-disable is correct.
  // var is need to define things on globalThis
  // See https://github.com/typescript-eslint/typescript-eslint/issues/7941
  // eslint-disable-next-line no-var
  var customTSWorkerFactory: CustomTSWebWorkerFactory;
}

const getURI = (host: string, path: string) =>
  monaco.Uri.from({
    scheme: "file",
    authority: host,
    path: path,
  });

const getScriptCandidates = (path: string, base: FilePath): ScriptFilePath[] => {
  if (isLegacyScript(base)) {
    return [resolveScriptFilePath(path, base, ".script")].filter(Boolean) as ScriptFilePath[];
  } else {
    if (hasScriptExtension(path)) {
      return [resolveScriptFilePath(path, base)].filter(Boolean) as ScriptFilePath[];
    } else {
      return scriptExtensions.map((ext) => resolveScriptFilePath(path, base, ext)).filter(Boolean) as ScriptFilePath[];
    }
  }
};

globalThis.customTSWorkerFactory = (TSWorkerClass, __tsc, __libs) => {
  class CustomWorker extends TSWorkerClass implements Partial<ts.LanguageServiceHost> {
    /**
     * Resolve a list of module identifier relative to the containing module.
     * @param moduleLiterals List of module identifiers to resolve.
     * @param containingFile The monaco URI of the containing module, as a string.
     * @returns An array of module resolutions, in the same order as arguments.
     */
    resolveModuleNameLiterals?(
      moduleLiterals: readonly ts.StringLiteralLike[],
      containingFile: string,
      __redirectedReference: ts.ResolvedProjectReference | undefined,
      __options: ts.CompilerOptions,
      __containingSourceFile: ts.SourceFile,
      __reusedNames: readonly ts.StringLiteralLike[] | undefined,
    ): readonly ts.ResolvedModuleWithFailedLookupLocations[] {
      const { scheme, authority: host, path } = monaco.Uri.parse(containingFile);
      if (scheme != "file") {
        return [];
      }
      const base = asFilePath(path.slice(1));
      return moduleLiterals.map(({ text: path }) => {
        const failedLookupLocations: string[] = [];
        const candidates = getScriptCandidates(path, base);
        let resolvedFileName: string | undefined;
        for (const candidate of candidates) {
          const candidateURI = getURI(host, candidate).toString();
          if (this.fileExists!(candidateURI)) {
            resolvedFileName = candidateURI;
            break;
          } else {
            failedLookupLocations.push(candidateURI);
          }
        }
        return {
          resolvedModule: resolvedFileName
            ? {
                resolvedFileName,
                extension: allScriptExtensions.find((ext) => resolvedFileName!.endsWith(ext))!,
              }
            : undefined,
          failedLookupLocations,
        };
      });
    }
  }
  return CustomWorker;
};
