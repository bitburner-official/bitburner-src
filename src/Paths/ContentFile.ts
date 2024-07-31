import type { BaseServer } from "../Server/BaseServer";
import { ScriptFilePath } from "./ScriptFilePath";
import { TextFilePath } from "./TextFilePath";

/** Provide a common interface for accessing script and text files */
export type ContentFilePath = ScriptFilePath | TextFilePath;
export interface ContentFile {
  filename: ContentFilePath;
  content: string;
  deleteFromServer: (server: BaseServer) => boolean;
}
export type ContentFileMap = Map<ContentFilePath, ContentFile>;
