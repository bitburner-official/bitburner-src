import type { BaseServer } from "../Server/BaseServer";
import type { ScriptFilePath } from "./ScriptFilePath";
import type { TextFilePath } from "./TextFilePath";
import { FileMetadata } from "./FileMetadata";

// Share a TextEncoder to avoid creating a new instance for each size calculation.
// TextEncoder is stateless, so sharing it is safe.
const textEncoder = new TextEncoder();

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
  /**
   * Returns the UTF-8 byte size of the file content.
   */
  getSize(): number {
    return textEncoder.encode(this.content).length;
  }
}
export type ContentFileMap = Map<ContentFilePath, ContentFile>;

/** Generator function to allow iterating through all content files on a server */
export function* allContentFiles(server: BaseServer): Generator<[ContentFilePath, ContentFile], void, undefined> {
  yield* server.scripts;
  yield* server.textFiles;
}
