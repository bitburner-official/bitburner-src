import { SaveData } from "../types";

export abstract class SaveDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnsupportedSaveData extends SaveDataError {}

export class InvalidSaveData extends SaveDataError {}

export function canUseBinaryFormat(): boolean {
  return "CompressionStream" in globalThis;
}

async function compress(dataString: string): Promise<Uint8Array> {
  const compressedReadableStream = new Blob([dataString]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(compressedReadableStream).arrayBuffer());
}

async function decompress(binaryData: Uint8Array): Promise<string> {
  const decompressedReadableStream = new Blob([binaryData]).stream().pipeThrough(new DecompressionStream("gzip"));
  const reader = decompressedReadableStream.pipeThrough(new TextDecoderStream()).getReader();
  let result = "";
  // Use "done" here to stop Lint from showing error
  const done = false;
  try {
    while (!done) {
      const readResult = await reader.read();
      if (readResult.done) {
        break;
      }
      result += readResult.value;
    }
  } catch (error) {
    throw new InvalidSaveData(String(error));
  } finally {
    reader.releaseLock();
  }
  return result;
}

export async function encodeJsonSaveString(jsonSaveString: string): Promise<SaveData> {
  // Fallback to the base64 format if player's browser does not support Compression Streams API.
  if (canUseBinaryFormat()) {
    return await compress(jsonSaveString);
  } else {
    // The unescape(encodeURIComponent()) pair encodes jsonSaveString into a "binary string" suitable for btoa, despite
    // seeming like a no-op at first glance.
    // Ref: https://stackoverflow.com/a/57713220
    return btoa(unescape(encodeURIComponent(jsonSaveString)));
  }
}

/** Return json save string */
export async function decodeSaveData(saveData: SaveData): Promise<string> {
  if (saveData instanceof Uint8Array) {
    if (!canUseBinaryFormat()) {
      throw new UnsupportedSaveData("Your browser does not support Compression Streams API");
    }
    return await decompress(saveData);
  } else {
    return decodeURIComponent(escape(atob(saveData)));
  }
}
