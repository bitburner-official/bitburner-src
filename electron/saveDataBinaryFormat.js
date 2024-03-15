const magicBytes = [0x1f, 0x8b];

function isBinaryFormat(rawData) {
  for (let i = 0; i < magicBytes.length; ++i) {
    if (magicBytes[i] !== rawData[i]) {
      return false;
    }
  }
  return true;
}

module.exports = { isBinaryFormat };
