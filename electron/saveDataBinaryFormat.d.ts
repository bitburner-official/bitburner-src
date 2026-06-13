export declare const encodeBytesToBase64String: (bytes: Uint8Array<ArrayBufferLike>) => string;
export declare const decodeBase64BytesToBytes: (bytes: Uint8Array<ArrayBufferLike>) => Uint8Array<ArrayBuffer>;
export declare const isBinaryFormat: (saveData: string | Uint8Array<ArrayBufferLike>) => boolean;
export declare const isSteamCloudFormat: (saveData: string | Uint8Array<ArrayBufferLike>) => boolean;
