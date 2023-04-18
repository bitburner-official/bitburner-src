import { isAbsolutePath } from "../Paths/Directory";
import { FilePath, isFilePath } from "../Paths/FilePath";
import type { LiteratureName } from "./data/LiteratureNames";

/**
 * Lore / world building literature files that can be found on servers.
 * These files can be read by the player
 */
export class Literature {
  title: string;
  fn: LiteratureName & FilePath;
  txt: string;

  constructor(title: string, filename: LiteratureName, txt: string) {
    this.title = title;
    if (!isFilePath(filename) || !isAbsolutePath(filename)) {
      throw new Error(`Error while initializing literatures. ${filename} could not be parsed as a filepath`);
    }
    this.fn = filename;
    this.txt = txt;
  }
}
