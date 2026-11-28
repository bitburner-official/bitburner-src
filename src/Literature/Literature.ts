import { FilePath, asFilePath } from "../Paths/FilePath";
import type { LiteratureName, FactionName } from "@enums";

interface LiteratureConstructorParams {
  title: string;
  filename: LiteratureName;
  factionRumors?: FactionName[];
  text: JSX.Element;
}
/**
 * Lore / world building literature files that can be found on servers.
 * These files can be read by the player
 */
export class Literature {
  title: string;
  filename: LiteratureName & FilePath;
  factionRumors: FactionName[];
  text: JSX.Element;

  constructor({ title, filename, factionRumors, text }: LiteratureConstructorParams) {
    this.title = title;
    this.filename = asFilePath(filename);
    this.factionRumors = factionRumors || [];
    this.text = text;
  }
}
