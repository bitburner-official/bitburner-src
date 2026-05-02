import { resolveFilePath } from "../Paths/FilePath";
import { hasTextExtension } from "../Paths/TextFilePath";
import { hasScriptExtension } from "../Paths/ScriptFilePath";
import { GetServer, GetAllServers } from "../Server/AllServers";
import {
  RFAMessage,
  isFileServer,
  isFileLocation,
  isFileData,
  type FileData,
  type FileLocation,
  type FileServer,
} from "./MessageDefinitions";

import libSource from "../ScriptEditor/NetscriptDefinitions.d.ts?raw";
import { saveObject } from "../SaveObject";
import { Player } from "@player";
import type { BaseServer } from "../Server/BaseServer";
import type { ContentFilePath } from "../Paths/ContentFile";

type SuccessResult<T> = { success: true; params: T };
type FailureResult = { success: false; errorResponse: RFAMessage };
export type ValidationResult<T> = SuccessResult<T> | FailureResult;

function getErrorResponse(errorMsg: string, { id }: RFAMessage): RFAMessage {
  return new RFAMessage({ error: errorMsg, id });
}

function validateParams<T>(validationFunction: (p: unknown) => p is T, request: RFAMessage): ValidationResult<T> {
  if (!request.params) {
    return { success: false, errorResponse: getErrorResponse("Missing params", request) };
  }
  if (!validationFunction(request.params)) {
    return {
      success: false,
      errorResponse: getErrorResponse(`Invalid params: ${JSON.stringify(request.params)}`, request),
    };
  }
  return { success: true, params: request.params };
}

function validateFilePathAndServerParams<T extends FileData | FileLocation>(
  validationFunction: (p: unknown) => p is T,
  request: RFAMessage,
): { success: true; data: { filePath: ContentFilePath; server: BaseServer; params: T } } | FailureResult {
  const validationResult = validateParams(validationFunction, request);
  if (!validationResult.success) {
    return validationResult;
  }
  const params = validationResult.params;
  const filePath = resolveFilePath(params.filename);
  if (!filePath) {
    return { success: false, errorResponse: getErrorResponse(`Invalid file path: ${params.filename}`, request) };
  }

  if (!hasTextExtension(filePath) && !hasScriptExtension(filePath)) {
    return {
      success: false,
      errorResponse: getErrorResponse(`Invalid file extension. Filename: ${params.filename}`, request),
    };
  }

  const server = GetServer(params.server);
  if (!server) {
    return { success: false, errorResponse: getErrorResponse(`Invalid hostname: ${params.server}`, request) };
  }

  return { success: true, data: { filePath, server, params } };
}

function validateServerParams(
  request: RFAMessage,
): { success: true; data: { server: BaseServer; params: FileServer } } | FailureResult {
  const validationResult = validateParams(isFileServer, request);
  if (!validationResult.success) {
    return validationResult;
  }
  const fileServer = validationResult.params;

  const server = GetServer(fileServer.server);
  if (!server) {
    return { success: false, errorResponse: getErrorResponse(`Invalid hostname: ${fileServer.server}`, request) };
  }

  return { success: true, data: { server, params: fileServer } };
}

export const RFARequestHandler: Record<string, (message: RFAMessage) => RFAMessage | Promise<RFAMessage>> = {
  pushFile: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateFilePathAndServerParams(isFileData, msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    validationData.server.writeToContentFile(validationData.filePath, validationData.params.content);
    return new RFAMessage({ result: "OK", id: msg.id });
  },

  getFile: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateFilePathAndServerParams(isFileLocation, msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    const file = validationData.server.getContentFile(validationData.filePath);
    if (!file) {
      return getErrorResponse(`File does not exist. Filename: ${validationData.params.filename}`, msg);
    }

    return new RFAMessage({ result: file.content, id: msg.id });
  },

  getFileMetadata: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateFilePathAndServerParams(isFileLocation, msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    const file = validationData.server.getContentFile(validationData.filePath);
    if (!file) {
      return getErrorResponse(`File does not exist. Filename: ${validationData.params.filename}`, msg);
    }

    return new RFAMessage({
      result: {
        filename: file.filename,
        ...file.metadata.plain(),
      },
      id: msg.id,
    });
  },

  deleteFile: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateFilePathAndServerParams(isFileLocation, msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    const resultOfRemovingFile = validationData.server.removeFile(validationData.filePath);
    if (!resultOfRemovingFile.res) {
      return getErrorResponse(resultOfRemovingFile.msg ?? "Failed", msg);
    }

    return new RFAMessage({ result: "OK", id: msg.id });
  },

  getFileNames: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateServerParams(msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    const fileNameList = [...validationData.server.textFiles.keys(), ...validationData.server.scripts.keys()];

    return new RFAMessage({ result: fileNameList, id: msg.id });
  },

  getAllFiles: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateServerParams(msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    const fileList = [...validationData.server.scripts, ...validationData.server.textFiles].map(([filename, file]) => ({
      filename,
      content: file.content,
    }));
    return new RFAMessage({ result: fileList, id: msg.id });
  },

  getAllFileMetadata: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateServerParams(msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    const fileList = [...validationData.server.scripts, ...validationData.server.textFiles].map(([filename, file]) => ({
      filename: filename,
      ...file.metadata.plain(),
    }));
    return new RFAMessage({ result: fileList, id: msg.id });
  },

  calculateRam: function (msg: RFAMessage): RFAMessage {
    const validationResult = validateFilePathAndServerParams(isFileLocation, msg);
    if (!validationResult.success) {
      return validationResult.errorResponse;
    }
    const validationData = validationResult.data;

    // Validate filePath again. validateFilePathAndServerParams only checks if filePath is a text file or a script.
    if (!hasScriptExtension(validationData.filePath)) {
      return getErrorResponse(`File is not a script. Filename: ${validationData.params.filename}`, msg);
    }

    const script = validationData.server.scripts.get(validationData.filePath);
    if (!script) {
      return getErrorResponse(`File does not exist. Filename: ${validationData.params.filename}`, msg);
    }

    const ramUsage = script.getRamUsage(validationData.server.scripts);
    if (!ramUsage) {
      return getErrorResponse(
        `Cannot calculate RAM usage of an invalid script. Filename: ${validationData.params.filename}`,
        msg,
      );
    }

    return new RFAMessage({ result: ramUsage, id: msg.id });
  },

  getDefinitionFile: function (msg: RFAMessage): RFAMessage {
    return new RFAMessage({ result: libSource, id: msg.id });
  },

  getSaveFile: async function (msg: RFAMessage): Promise<RFAMessage> {
    const saveData = await saveObject.getSaveData();

    if (typeof saveData === "string") {
      return new RFAMessage({
        result: {
          identifier: Player.identifier,
          binary: false,
          save: saveData,
        },
        id: msg.id,
      });
    }

    // We can't serialize the Uint8Array directly, so we convert every integer to a character and make a string out of the array
    // The external editor can simply recreate the save by converting each char back to their char code
    let converted = "";
    for (let i = 0; i < saveData.length; i++) {
      converted += String.fromCharCode(saveData[i]);
    }

    return new RFAMessage({
      result: {
        identifier: Player.identifier,
        binary: true,
        save: converted,
      },
      id: msg.id,
    });
  },

  getAllServers: function (msg: RFAMessage): RFAMessage {
    const servers = GetAllServers().map(({ hostname, hasAdminRights, purchasedByPlayer }) => ({
      hostname,
      hasAdminRights,
      purchasedByPlayer,
    }));

    return new RFAMessage({ result: servers, id: msg.id });
  },
};
