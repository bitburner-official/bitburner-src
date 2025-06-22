import type { BaseServer } from "../Server/BaseServer";
import type { ScriptFilePath } from "./ScriptFilePath";
import type { TextFilePath } from "./TextFilePath";
import { FileMetadata } from "./FileMetadata";

/** Provide a common interface for accessing script and text files */
export type ContentFilePath = ScriptFilePath | TextFilePath;
export abstract class ContentFile {
  abstract filename: ContentFilePath;
  // Inherited classes must call this.metadata.read() when implementing this getter.
  abstract get content(): string;
  // Inherited classes must call this.metadata.edit() when implementing this setter.
  abstract set content(value: string);
  metadata: FileMetadata;
  constructor() {
    this.metadata = new FileMetadata();
  }
  abstract deleteFromServer(server: BaseServer): boolean;
}
export type ContentFileMap = Map<ContentFilePath, ContentFile>;

/** Generator function to allow iterating through all content files on a server */
export function* allContentFiles(server: BaseServer): Generator<[ContentFilePath, ContentFile], void, undefined> {
  yield* server.scripts;
  yield* server.textFiles;
}
