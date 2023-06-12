import { FilePath, asFilePath } from "../Paths/FilePath";
import type { LiteratureName } from "@enums";

interface LiteratureConstructorParams {
  title: string;
  filename: LiteratureName;
  text: string;
}
/**
 * Lore / world building literature files that can be found on servers.
 * These files can be read by the player
 */
export class Literature {
  title: string;
  filename: LiteratureName & FilePath;
  text: string;

  constructor({ title, filename, text }: LiteratureConstructorParams) {
    this.title = title;
    this.filename = asFilePath(filename);
    this.text = text;
  }
}
