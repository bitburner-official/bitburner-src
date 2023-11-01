import { FilePath, asFilePath } from "../Paths/FilePath";
import { MessageFilename, FactionName } from "@enums";

export class Message {
  // Name of Message file
  filename: MessageFilename & FilePath;

  // The text contains in the Message
  msg: string;

  // Faction hinted at by the message
  factionRumors: FactionName[];

  constructor(filename: MessageFilename, msg: string, factionRumor?: FactionName) {
    this.filename = asFilePath(filename);
    this.msg = msg;
    this.factionRumors = factionRumor ? [factionRumor] : [];
  }
}
