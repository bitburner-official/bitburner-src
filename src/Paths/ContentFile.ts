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

/** Generator function to allow iterating through all content files on a server */
export function* allContentFiles(server: BaseServer): Generator<[ContentFilePath, ContentFile], void, undefined> {
  yield* server.scripts;
  yield* server.textFiles;
}
