import { GetServer } from "../../Server/AllServers";
import { editor, Uri } from "monaco-editor";
import { OpenScript } from "./OpenScript";
import { getFileType, FileType } from "../../utils/ScriptTransformer";
import { throwIfReachable } from "../../utils/helpers/throwIfReachable";

function getServerCode(scripts: OpenScript[], index: number): string | null {
  const openScript = scripts[index];
  const server = GetServer(openScript.hostname);
  if (server === null) throw new Error(`Server '${openScript.hostname}' should not be null, but it is.`);
  const data = server.getContentFile(openScript.path)?.content ?? null;
  return data;
}

function dirty(scripts: OpenScript[], index: number): string {
  const openScript = scripts[index];
  const serverData = getServerCode(scripts, index);
  if (serverData === null) return " *";
  return serverData !== openScript.code ? " *" : "";
}

function reorder(list: unknown[], startIndex: number, endIndex: number): void {
  const [removed] = list.splice(startIndex, 1);
  list.splice(endIndex, 0, removed);
}

function makeModel(hostname: string, filename: string, code: string): editor.ITextModel {
  const uri = Uri.from({
    scheme: "memory",
    path: `${hostname}/${filename}`,
  });
  // If there is a model with this URI and it's not disposed, return it.
  const model = editor.getModel(uri);
  if (model && !model.isDisposed()) {
    return model;
  }
  let language;
  const fileType = getFileType(filename);
  switch (fileType) {
    case FileType.PLAINTEXT:
      language = "plaintext";
      break;
    case FileType.JSON:
      language = "json";
      break;
    case FileType.JS:
    case FileType.JSX:
      language = "javascript";
      break;
    case FileType.TS:
    case FileType.TSX:
      language = "typescript";
      break;
    case FileType.NS1:
      language = "javascript";
      break;
    default:
      throwIfReachable(fileType);
  }
  return editor.createModel(code, language, uri);
}

export { getServerCode, dirty, reorder, makeModel };
