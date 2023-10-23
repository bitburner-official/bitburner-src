import { FilePath, asFilePath } from "../Paths/FilePath";
import type { LiteratureName, FactionName } from "@enums";

interface LiteratureConstructorParams {
  title: string;
  filename: LiteratureName;
  rumorForFaction?: FactionName[];
  text: string;
}
/**
 * Lore / world building literature files that can be found on servers.
 * These files can be read by the player
 */
export class Literature {
  title: string;
  filename: LiteratureName & FilePath;
  rumorForFaction: FactionName[];
  text: string;

  constructor({ title, filename, rumorForFaction, text }: LiteratureConstructorParams) {
    this.title = title;
    this.filename = asFilePath(filename);
    this.rumorForFaction = rumorForFaction || [];
    this.text = text;
  }
}
