import { saveObject } from "../../src/SaveObject";
import { Factions } from "../../src/Faction/Factions";
import { Player, setPlayer } from "../../src/Player";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
import { joinFaction } from "../../src/Faction/FactionHelpers";
import { AugmentationName, CompanyName, CrimeType, FactionName } from "../../src/Enums";
import { Augmentations } from "../../src/Augmentation/Augmentations";
import { SleeveCrimeWork } from "../../src/PersonObjects/Sleeve/Work/SleeveCrimeWork";
import { Companies } from "../../src/Company/Companies";

describe("Check Save File Continuity", () => {
  establishInitialConditions();
  // Calling getSaveString forces save info to update
  saveObject.getSaveData();

  const savesToTest = ["FactionsSave", "PlayerSave", "CompaniesSave", "GoSave"] as const;
  for (const saveToTest of savesToTest) {
    test(`${saveToTest} continuity`, () => {
      const parsed = JSON.parse(saveObject[saveToTest]);
      expect(parsed).toMatchSnapshot();
    });
  }
});

function establishInitialConditions() {
  // Jest overrides to produce static savedata
  jest.useFakeTimers().setSystemTime(1687611703623);
  let i = 0.5;
  Math.random = () => {
    return (++i % 37) / 37;
  };

  // Game initializers
  setPlayer(new PlayerObject());
  Player.init();
  Player.identifier = "Overwritten identifier";
  Player.sleevesFromCovenant = 1;
  Player.sourceFiles.set(10, 1);
  Player.prestigeAugmentation();
  /* Not comparing servers yet
  // Just to reduce snapshot size, reduce server map to home + 2 servers
  for (let i = serverMetadata.length - 1; i >= 0; i--) {
    if (!["zer0", "n00dles"].includes(serverMetadata[i].hostname)) serverMetadata.splice(i, 1);
  }
  initForeignServers(Player.getHomeComputer());
  */

  // Sleeves (already added in game initializers section)
  Player.sleeves[0].installAugmentation(Augmentations[AugmentationName.BionicArms]);
  Player.sleeves[0].startWork(new SleeveCrimeWork(CrimeType.homicide));

  // Factions
  const bladeburnerFaction = Factions[FactionName.Bladeburners];
  const csec = Factions[FactionName.CyberSec];
  const slumSnakes = Factions[FactionName.SlumSnakes];
  joinFaction(bladeburnerFaction);
  joinFaction(csec);
  joinFaction(slumSnakes);
  csec.playerReputation = 1e6;
  csec.setFavor(20);

  // Companies
  const noodleBar = Companies[CompanyName.NoodleBar];
  noodleBar.setFavor(100);
  noodleBar.playerReputation = 100000;

  // Bladeburner. Adding rank will also add bladeburner faction rep.
  Player.startBladeburner();
  Player.bladeburner?.changeRank(Player, 2000);

  // Corp
  Player.startCorporation("Test Corp", false);

  // Gang
  Player.startGang(FactionName.SlumSnakes, false);
}
