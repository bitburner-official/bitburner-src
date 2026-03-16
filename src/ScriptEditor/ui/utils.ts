import { GetServer } from "../../Server/AllServers";
import { editor, Uri } from "monaco-editor";
import { OpenScript } from "./OpenScript";
import { getFileType, FileType } from "../../utils/ScriptTransformer";
import { throwIfReachable } from "../../utils/helpers/throwIfReachable";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "../../Enums";
import { EditorEvents } from "../EditorData";
import { Settings } from "../../Settings/Settings";
import { saveObject } from "../../SaveObject";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

export function getServerCode(scripts: OpenScript[], index: number): string | null {
  const openScript = scripts[index];
  const server = GetServer(openScript.hostname);
  if (server === null) {
    return null;
  }
  const data = server.getContentFile(openScript.path)?.content ?? null;
  return data;
}

export function isUnsavedFile(scripts: OpenScript[], index: number): boolean {
  const openScript = scripts[index];
  const serverData = getServerCode(scripts, index);
  if (serverData === null) {
    return true;
  }
  return serverData !== openScript.code;
}

export function reorder(list: unknown[], startIndex: number, endIndex: number): void {
  const [removed] = list.splice(startIndex, 1);
  list.splice(endIndex, 0, removed);
}

export function makeModel(hostname: string, filename: string, code: string): editor.ITextModel {
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
    case FileType.CSS:
      language = "css";
      break;
    default:
      throwIfReachable(fileType);
  }
  return editor.createModel(code, language, uri);
}

export function getTabId(hostname: string, filePath: string): string {
  return `${hostname}:/${filePath}`;
}

export function saveScript(scriptToSave: OpenScript): void {
  const server = GetServer(scriptToSave.hostname);
  if (!server) {
    dialogBoxCreate(`Server ${scriptToSave.hostname} does not exist.`);
    return;
  }
  // Show a warning message if the file is on a non-home server.
  if (scriptToSave.hostname !== SpecialServers.Home) {
    SnackbarEvents.emit("You saved a file on a non-home server!", ToastVariant.WARNING, 3000);
  }
  // This server helper already handles overwriting, etc.
  server.writeToContentFile(scriptToSave.path, scriptToSave.code);

  EditorEvents.emit(scriptToSave.hostname, scriptToSave.path);

  if (Settings.SaveGameOnFileSave) {
    saveObject.saveGame().catch((error) => exceptionAlert(error));
  }
}
