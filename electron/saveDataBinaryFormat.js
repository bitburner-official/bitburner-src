const magicBytes = [0];

const binaryFormatVersionByte = 0;

function isBinaryFormat(rawData) {
  for (let i = 0; i < magicBytes.length; ++i) {
    if (magicBytes[i] !== rawData[i]) {
      return false;
    }
  }
  return true;
}

module.exports = { magicBytes, binaryFormatVersionByte, isBinaryFormat };
