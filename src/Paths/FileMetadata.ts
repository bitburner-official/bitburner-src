import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

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

  /** Change metadate to reflect a read just happened */
  read() {
    this.atime = Date.now();
  }

  /** Change metadate to reflect a write just happened */
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

  // Serialize the current object to a JSON save state
  toJSON(): IReviverValue {
    return Generic_toJSON("FileMetadata", this);
  }

  // Initializes a Script Object from a JSON save state
  static fromJSON(value: IReviverValue): FileMetadata {
    return Generic_fromJSON(FileMetadata, value.data);
  }
}

constructorsForReviver.FileMetadata = FileMetadata;
