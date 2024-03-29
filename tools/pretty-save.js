/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs").promises;
const path = require("path");
const { isBinaryFormat } = require("../electron/saveDataBinaryFormat");

async function getSave(file) {
  const data = await fs.readFile(file);

  let jsonSaveString;
  if (isBinaryFormat(data)) {
    const decompressedReadableStream = new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip"));
    jsonSaveString = await new Response(decompressedReadableStream).text();
  } else {
    jsonSaveString = decodeURIComponent(escape(atob(data)));
  }

  const save = JSON.parse(jsonSaveString);
  const saveData = save.data;
  let gameSave = {
    PlayerSave: JSON.parse(saveData.PlayerSave),
    CompaniesSave: JSON.parse(saveData.CompaniesSave),
    FactionsSave: JSON.parse(saveData.FactionsSave),
    AliasesSave: JSON.parse(saveData.AliasesSave),
    GlobalAliasesSave: JSON.parse(saveData.GlobalAliasesSave),
    StockMarketSave: JSON.parse(saveData.StockMarketSave),
    SettingsSave: JSON.parse(saveData.SettingsSave),
    VersionSave: JSON.parse(saveData.VersionSave),
    LastExportBonus: JSON.parse(saveData.LastExportBonus),
    StaneksGiftSave: JSON.parse(saveData.StaneksGiftSave),
    SaveTimestamp: new Date(parseInt(saveData.SaveTimestamp ?? "0", 10)).toLocaleString(),
  };

  const serverStrings = JSON.parse(saveData.AllServersSave);
  const servers = {};
  for (const [key, value] of Object.entries(serverStrings)) {
    servers[key] = value.data;
  }

  gameSave.AllServersSave = servers;

  if (saveData.AllGangsSave) {
    gameSave.AllGangsSave = JSON.parse(saveData.AllGangsSave);
  }

  return gameSave;
}

async function main(input, output) {
  const result = await getSave(input);
  await fs.writeFile(output, JSON.stringify(result, null, 2));
  return result;
}

const input = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);

console.log(`Input: ${input}`);
console.log(`Output: ${output}`);

main(input, output).then(() => {
  console.log("Done!");
});
