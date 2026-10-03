import { makeSerializable } from "../utils/GenericReviver";

export class FileMetadata {
  /** Time of Access */
  public atime: number;
  /** Time of Modification */
  public mtime: number;
  /** Time of Birth (creation) */
  public btime: number;

  /** Create a FileMetadata with everything set to the current time */
  constructor() {
    const now = Date.now();
    this.atime = now;
    this.mtime = now;
    this.btime = now;
  }

  /** Change metadata to reflect a read just happened */
  read() {
    this.atime = Date.now();
  }

  /** Change metadata to reflect a write just happened */
  edit() {
    this.mtime = Date.now();
  }

  /** Get a plain version of this object */
  plain() {
    return {
      atime: this.atime,
      mtime: this.mtime,
      btime: this.btime,
    };
  }

  static includedKeys = makeSerializable("FileMetadata", FileMetadata);
}
