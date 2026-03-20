// The 2 magic bytes of the gzip header plus the mandatory compression type of DEFLATE
const magicBytesOfDeflateGzip = new Uint8Array([0x1f, 0x8b, 0x08]);
// Base64-encoded string of magicBytesOfDeflateGzip
const base64EncodingOfMagicBytes = magicBytesOfDeflateGzip.toBase64();
// Convert the base64-encoded string to a byte array
const byteArrayOfBase64EncodingOfMagicBytes = Uint8Array.from(base64EncodingOfMagicBytes, (c) => c.charCodeAt(0));

/**
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function decodeBase64BytesToBytes(bytes) {
  return Uint8Array.fromBase64(new TextDecoder("windows-1252").decode(bytes));
}

/**
 * @param {string | Uint8Array} rawData
 * @returns {boolean}
 */
function isBinaryFormat(rawData) {
  for (let i = 0; i < magicBytesOfDeflateGzip.length; ++i) {
    if (magicBytesOfDeflateGzip[i] !== rawData[i]) {
      return false;
    }
  }
  return true;
}

/**
 * The Steam Cloud save file is a base64-encoded gz file.
 *
 * @param {string | Uint8Array} rawData
 * @returns {boolean}
 */
function isSteamCloudFormat(rawData) {
  if (typeof rawData === "string") {
    return rawData.startsWith(base64EncodingOfMagicBytes);
  }
  for (let i = 0; i < byteArrayOfBase64EncodingOfMagicBytes.length; ++i) {
    if (byteArrayOfBase64EncodingOfMagicBytes[i] !== rawData[i]) {
      return false;
    }
  }
  return true;
}

module.exports = { decodeBase64BytesToBytes, isBinaryFormat, isSteamCloudFormat };
