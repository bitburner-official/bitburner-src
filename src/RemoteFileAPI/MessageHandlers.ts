import { resolveFilePath } from "../Paths/FilePath";
import { hasTextExtension } from "../Paths/TextFilePath";
import { hasScriptExtension } from "../Paths/ScriptFilePath";
import { GetServer, GetAllServers } from "../Server/AllServers";
import {
  RFAMessage,
  FileData,
  FileContent,
  isFileServer,
  isFileLocation,
  FileLocation,
  isFileData,
} from "./MessageDefinitions";

import libSource from "!!raw-loader!../ScriptEditor/NetscriptDefinitions.d.ts";

function error(errorMsg: string, { id }: RFAMessage): RFAMessage {
  return new RFAMessage({ error: errorMsg, id: id });
}

export const RFARequestHandler: Record<string, (message: RFAMessage) => void | RFAMessage> = {
  pushFile: function (msg: RFAMessage): RFAMessage {
    if (!isFileData(msg.params)) return error("Misses parameters", msg);

    const fileData: FileData = msg.params;
    const filePath = resolveFilePath(fileData.filename);
    if (!filePath) return error("Invalid file path", msg);

    const server = GetServer(fileData.server);
    if (!server) return error("Server hostname invalid", msg);

    if (hasTextExtension(filePath) || hasScriptExtension(filePath)) {
      server.writeToContentFile(filePath, fileData.content);
      return new RFAMessage({ result: "OK", id: msg.id });
    }
    return error("Invalid file extension", msg);
  },

  getFile: function (msg: RFAMessage): RFAMessage {
    if (!isFileLocation(msg.params)) return error("Message misses parameters", msg);

    const fileData: FileLocation = msg.params;
    const filePath = resolveFilePath(fileData.filename);
    if (!filePath) return error("Invalid file path", msg);

    const server = GetServer(fileData.server);
    if (!server) return error("Server hostname invalid", msg);

    if (!hasTextExtension(filePath) && !hasScriptExtension(filePath)) return error("Invalid file extension", msg);
    const file = server.getContentFile(filePath);
    if (!file) return error("File doesn't exist", msg);
    return new RFAMessage({ result: file.content, id: msg.id });
  },

  deleteFile: function (msg: RFAMessage): RFAMessage {
    if (!isFileLocation(msg.params)) return error("Message misses parameters", msg);

    const fileData: FileLocation = msg.params;
    const filePath = resolveFilePath(fileData.filename);
    if (!filePath) return error("Invalid filename", msg);

    const server = GetServer(fileData.server);
    if (!server) return error("Server hostname invalid", msg);

    const result = server.removeFile(filePath);
    if (result.res) return new RFAMessage({ result: "OK", id: msg.id });
    return error(result.msg ?? "Failed", msg);
  },

  getFileNames: function (msg: RFAMessage): RFAMessage {
    if (!isFileServer(msg.params)) return error("Message misses parameters", msg);

    const server = GetServer(msg.params.server);
    if (!server) return error("Server hostname invalid", msg);

    const fileNameList: string[] = [...server.textFiles.keys(), ...server.scripts.keys()];

    return new RFAMessage({ result: fileNameList, id: msg.id });
  },

  getAllFiles: function (msg: RFAMessage): RFAMessage {
    if (!isFileServer(msg.params)) return error("Message misses parameters", msg);

    const server = GetServer(msg.params.server);
    if (!server) return error("Server hostname invalid", msg);

    const fileList: FileContent[] = [...server.scripts, ...server.textFiles].map(([filename, file]) => ({
      filename,
      content: file.content,
    }));
    return new RFAMessage({ result: fileList, id: msg.id });
  },

  calculateRam: function (msg: RFAMessage): RFAMessage {
    if (!isFileLocation(msg.params)) return error("Message misses parameters", msg);
    const fileData: FileLocation = msg.params;
    const filePath = resolveFilePath(fileData.filename);
    if (!filePath) return error("Invalid filename", msg);

    const server = GetServer(fileData.server);
    if (!server) return error("Server hostname invalid", msg);

    if (!hasScriptExtension(filePath)) return error("Filename isn't a script filename", msg);
    const script = server.scripts.get(filePath);
    if (!script) return error("File doesn't exist", msg);
    const ramUsage = script.getRamUsage(server.scripts);
    if (!ramUsage) return error("Ram cost could not be calculated", msg);
    return new RFAMessage({ result: ramUsage, id: msg.id });
  },

  getDefinitionFile: function (msg: RFAMessage): RFAMessage {
    return new RFAMessage({ result: libSource + "", id: msg.id });
  },

  getAllServers: function (msg: RFAMessage): RFAMessage {
    const servers = GetAllServers().map(({ hostname, hasAdminRights }) => ({
      hostname,
      hasAdminRights,
    }));

    return new RFAMessage({ result: servers, id: msg.id });
  },
};
