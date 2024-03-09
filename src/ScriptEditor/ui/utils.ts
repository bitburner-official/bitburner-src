import { GetServer } from "../../Server/AllServers";
import { editor, Uri } from "monaco-editor";
import { OpenScript } from "./OpenScript";

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
function makeModel(hostname: string, filename: string, code: string) {
  const uri = Uri.from({
    scheme: "file",
    path: `${hostname}/${filename}`,
  });
  const language = filename.endsWith(".txt") ? "plaintext" : filename.endsWith(".json") ? "json" : "javascript";
  //if somehow a model already exist return it
  return editor.getModel(uri) ?? editor.createModel(code, language, uri);
}

export { getServerCode, dirty, reorder, makeModel };
