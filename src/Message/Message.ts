import { MessageFilename } from "./MessageHelpers";

export class Message {
  // Name of Message file
  filename: MessageFilename;

  // The text contains in the Message
  msg: string;

  constructor(filename: MessageFilename, msg: string) {
    this.filename = filename;
    this.msg = msg;
  }
}
