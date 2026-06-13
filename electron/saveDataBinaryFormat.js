// The 2 magic bytes of the gzip header plus the mandatory compression type of DEFLATE
const magicBytesOfDeflateGzip = new Uint8Array([0x1f, 0x8b, 0x08]);
// Base64-encoded string of magicBytesOfDeflateGzip
const base64EncodingOfMagicBytes = encodeBytesToBase64String(magicBytesOfDeflateGzip);
// Convert the base64-encoded string to a byte array
const byteArrayOfBase64EncodingOfMagicBytes = Uint8Array.from(base64EncodingOfMagicBytes, (c) => c.charCodeAt(0));

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function encodeBytesToBase64String(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

/**
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function decodeBase64BytesToBytes(bytes) {
  let base64String = "";
  for (let i = 0; i < bytes.length; i++) {
    base64String += String.fromCharCode(bytes[i]);
  }
  const decodedBinaryString = atob(base64String);
  const result = new Uint8Array(decodedBinaryString.length);
  for (let i = 0; i < decodedBinaryString.length; i++) {
    result[i] = decodedBinaryString.charCodeAt(i);
  }
  return result;
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

module.exports = { encodeBytesToBase64String, decodeBase64BytesToBytes, isBinaryFormat, isSteamCloudFormat };
