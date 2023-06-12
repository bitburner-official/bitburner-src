import { FilePath, asFilePath } from "../Paths/FilePath";
import { MessageFilename } from "@enums";

export class Message {
  // Name of Message file
  filename: MessageFilename & FilePath;

  // The text contains in the Message
  msg: string;

  constructor(filename: MessageFilename, msg: string) {
    this.filename = asFilePath(filename);
    this.msg = msg;
  }
}
