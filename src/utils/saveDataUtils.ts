import { SaveData } from "../types";
import { compress, decompress } from "./compressionUtils";

export function canUseBinaryFormat(): boolean {
  return "CompressionStream" in globalThis;
}

export async function encodeJsonSaveString(jsonSaveString: string, useBinaryFormat: boolean): Promise<SaveData> {
  // Fallback to base64 format if the player doesn't want to compress the save data or their browser does not support
  // Compression Streams API.
  if (useBinaryFormat && canUseBinaryFormat()) {
    return await compress(jsonSaveString);
  } else {
    return btoa(unescape(encodeURIComponent(jsonSaveString)));
  }
}

/** Return json save string */
export async function decodeSaveData(saveData: SaveData): Promise<string> {
  if (saveData instanceof Uint8Array) {
    if (!canUseBinaryFormat()) {
      throw new Error("Your browser does not support Compression Streams API");
    }
    return await decompress(saveData);
  } else {
    return decodeURIComponent(escape(atob(saveData)));
  }
}
