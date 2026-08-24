import type { SaveData } from "../types";
import type { BaseServer } from "../Server/BaseServer";

abstract class RFAMessage {
  jsonrpc = "2.0";
  public id: number; // ID to keep track of request -> response interaction

  constructor(id: number) {
    this.id = id;
  }
}

export class RFARequest extends RFAMessage {
  public method: string;
  public params: FileDescription & PaginationParams;

  constructor(obj: { id: number; method: string; params: FileDescription & PaginationParams }) {
    super(obj.id);
    this.method = obj.method;
    this.params = obj.params;
  }
}

export abstract class RFAResponse extends RFAMessage {}

export class RFASuccessResponse extends RFAResponse {
  public result: ResultType;
  public total?: number;

  constructor(obj: { id: number; result: ResultType; total?: number }) {
    super(obj.id);
    this.result = obj.result;
    if (obj.total !== undefined) {
      this.total = obj.total;
    }
  }
}

export class RFAErrorResponse extends RFAResponse {
  public error: string;

  constructor(obj: { id: number; error: string }) {
    super(obj.id);
    this.error = obj.error;
  }
}

type ResultType =
  | string
  | number
  | string[]
  | FileContent[]
  | RFAServerData[]
  | {
      identifier: string;
      binary: boolean;
      save: SaveData;
    }
  | FileMetadata
  | FileMetadata[];

type FileDescription = FileData | FileContent | FileLocation | FileServer;

export interface FileData {
  filename: string;
  content: string;
  server: string;
}

export interface FileContent {
  filename: string;
  content: string;
}

export interface FileLocation {
  filename: string;
  server: string;
}

export interface FileServer {
  server: string;
}

export interface FileMetadata {
  filename: string;
  atime: number;
  mtime: number;
  btime: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export type RFAServerData = Pick<BaseServer, "hostname" | "hasAdminRights" | "purchasedByPlayer">;

export function isFileData(p: unknown): p is FileData {
  const pf = p as FileData;
  return typeof pf.server === "string" && typeof pf.filename === "string" && typeof pf.content === "string";
}

export function isFileLocation(p: unknown): p is FileLocation {
  const pf = p as FileLocation;
  return typeof pf.server === "string" && typeof pf.filename === "string";
}

export function isFileContent(p: unknown): p is FileContent {
  const pf = p as FileContent;
  return typeof pf.filename === "string" && typeof pf.content === "string";
}

export function isFileServer(p: unknown): p is FileServer {
  const pf = p as FileServer;
  return typeof pf.server === "string";
}
