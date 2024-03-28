// The 2 magic bytes of the gzip header plus the mandatory compression type of DEFLATE
const magicBytes = [0x1f, 0x8b, 0x08];

function isBinaryFormat(rawData) {
  for (let i = 0; i < magicBytes.length; ++i) {
    if (magicBytes[i] !== rawData[i]) {
      return false;
    }
  }
  return true;
}

module.exports = { isBinaryFormat };
