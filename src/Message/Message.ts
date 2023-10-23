import { FilePath, asFilePath } from "../Paths/FilePath";
import { MessageFilename, FactionName } from "@enums";

export class Message {
  // Name of Message file
  filename: MessageFilename & FilePath;

  // The text contains in the Message
  msg: string;

  // Faction hinted at by the message
  rumorForFaction: FactionName | undefined;

  constructor(filename: MessageFilename, msg: string, rumorForFaction?: FactionName) {
    this.filename = asFilePath(filename);
    this.msg = msg;
    if (rumorForFaction) this.rumorForFaction = rumorForFaction;
  }
}
