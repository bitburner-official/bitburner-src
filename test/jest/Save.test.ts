import fs from "node:fs";

import { GetServerOrThrow, loadAllServers, saveAllServers } from "../../src/Server/AllServers";
import { loadAllRunningScripts } from "../../src/NetscriptWorker";
import { Settings } from "../../src/Settings/Settings";
import { Player, setPlayer } from "../../src/Player";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
import { UIEventEmitter, UIEventType } from "../../src/ui/UIEventEmitter";
import { fixDoImportIssue, getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";
import { getSaveData, loadGame } from "../../src/SaveObject";
import { validBitNodes } from "../../src/BitNode/Constants";
import { staneksGift } from "../../src/CotMG/Helper";
import { joinFaction } from "../../src/Faction/FactionHelpers";
import { Factions } from "../../src/Faction/Factions";
import type { ScriptFilePath } from "../../src/Paths/ScriptFilePath";
import type { TextFilePath } from "../../src/Paths/TextFilePath";
import { StockMarket } from "../../src/StockMarket/StockMarket";
import { Go } from "../../src/Go/Go";
import { Companies } from "../../src/Company/Companies";
import { Aliases, GlobalAliases } from "../../src/Alias";
import { AllGangs } from "../../src/Gang/AllGangs";
import { InfiltrationState } from "../../src/Infiltration/formulas/game";
import { DarknetState } from "../../src/DarkNet/models/DarknetState";
import type { ClassWork } from "../../src/Work/ClassWork";
import type { CompanyWork } from "../../src/Work/CompanyWork";
import type { CreateProgramWork } from "../../src/Work/CreateProgramWork";
import type { CrimeWork } from "../../src/Work/CrimeWork";
import type { FactionWork } from "../../src/Work/FactionWork";
import type { GraftingWork } from "../../src/Work/GraftingWork";
import type { SleeveBladeburnerWork } from "../../src/PersonObjects/Sleeve/Work/SleeveBladeburnerWork";
import type { SleeveClassWork } from "../../src/PersonObjects/Sleeve/Work/SleeveClassWork";
import type { SleeveCompanyWork } from "../../src/PersonObjects/Sleeve/Work/SleeveCompanyWork";
import type { SleeveCrimeWork } from "../../src/PersonObjects/Sleeve/Work/SleeveCrimeWork";
import type { SleeveFactionWork } from "../../src/PersonObjects/Sleeve/Work/SleeveFactionWork";
import type { SleeveInfiltrateWork } from "../../src/PersonObjects/Sleeve/Work/SleeveInfiltrateWork";
import type { SleeveRecoveryWork } from "../../src/PersonObjects/Sleeve/Work/SleeveRecoveryWork";
import type { SleeveSupportWork } from "../../src/PersonObjects/Sleeve/Work/SleeveSupportWork";
import type { SleeveSynchroWork } from "../../src/PersonObjects/Sleeve/Work/SleeveSynchroWork";

jest.useFakeTimers();

fixDoImportIssue();

// Direct tests of loading and saving.
// Tests here should try to be comprehensive (cover as much stuff as possible)
// without requiring burdensome levels of maintenance when legitimate changes
// are made.

// Savegame generated from dev on 2023-03-12, mostly empty game with a few
// tweaks. A RunningScript was added in-game to test the one bit of
// non-trivial machinery involved in save/load.
//
// Most of the Servers have been removed to reduce space. Default values have
// been removed both for space, and to test that they are added correctly.
// The one remaining server has been renamed to "__proto__" to test the
// handling of darknet servers with unusual hostnames.
function loadStandardServers() {
  loadAllServers(String.raw`{
  "home": {
    "ctor": "Server",
    "data": {
      "hasAdminRights": true,
      "hostname": "home",
      "ip": "67.4.8.1",
      "isConnectedTo": true,
      "maxRam": 8,
      "messages": [
        "hackers-starting-handbook.lit"
      ],
      "organizationName": "Home PC",
      "programs": [
        "NUKE.exe"
      ],
      "ramUsed": 1.6,
      "runningScripts": [
        {
          "ctor": "RunningScript",
          "data": {
            "args": [],
            "filename": "script.js",
            "logs": [
              "I shouldn't even be saved, since I'm temporary"
            ],
            "logUpd": true,
            "offlineRunningTime": 0.01,
            "onlineRunningTime": 7.210000000000004,
            "pid": 3,
            "ramUsage": 1.6,
            "server": "home",
            "scriptKey": "script.js*[]",
            "temporary": true,
            "dependencies": [
              {
                "filename": "script.js",
                "url": "blob:http://localhost/302fe9e5-2ec3-4ed7-bb5a-4f8f4a85f46d",
                "moduleSequenceNumber": 2
              }
            ]
          }
        },
        {
          "ctor": "RunningScript",
          "data": {
            "args": [],
            "filename": "script.js",
            "logs": [
              "I'm a log line that should be pruned",
              "Another log line"
            ],
            "logUpd": true,
            "offlineRunningTime": 0.01,
            "onlineRunningTime": 7.210000000000004,
            "pid": 2,
            "ramUsage": 1.6,
            "server": "home",
            "scriptKey": "script.js*[]",
            "title": "Awesome Script",
            "dependencies": [
              {
                "filename": "script.js",
                "url": "blob:http://localhost/302fe9e5-2ec3-4ed7-bb5a-4f8f4a85f46d",
                "moduleSequenceNumber": 2
              }
            ]
          }
        }
      ],
      "scripts": {
        "ctor": "JSONMap",
        "data": [
          [
            "script.js",
            {
              "ctor": "Script",
              "data": {
                "code": "/** @param {NS} ns */\nexport async function main(ns) {\n  return ns.asleep(1000000);\n}",
                "filename": "script.js",
                "module": {},
                "dependencies": [
                  {
                    "filename": "script.js",
                    "url": "blob:http://localhost/e0abfafd-2c73-42fc-9eea-288c03820c47",
                    "moduleSequenceNumber": 5
                  }
                ],
                "ramUsage": 1.6,
                "server": "home",
                "moduleSequenceNumber": 5,
                "ramUsageEntries": [
                  {
                    "type": "misc",
                    "name": "baseCost",
                    "cost": 1.6
                  }
                ]
              }
            }
          ]
        ]
      },
      "serversOnNetwork": [
        "__proto__"
      ],
      "purchasedByPlayer": true
    }
  },
  "__proto__": {
    "ctor": "Server",
    "data": {
      "hostname": "__proto__",
      "ip": "61.6.6.2",
      "maxRam": 4,
      "organizationName": "Noodle Bar",
      "serversOnNetwork": [
        "home"
      ],
      "moneyAvailable": 70000,
      "moneyMax": 1750000,
      "numOpenPortsRequired": 0,
      "serverGrowth": 3000
    }
  }
}`); // Fix confused highlighting `
  loadAllRunningScripts();
  UIEventEmitter.emit(UIEventType.MainUILoaded);
}

test("load/saveAllServers", () => {
  // Feed a JSON object through loadAllServers/saveAllServers.
  // The object is a pruned set of servers that was extracted from a real (dev) game.
  jest.setSystemTime(123456789000);

  setPlayer(new PlayerObject());
  Player.playtimeSinceLastAug = 123456;
  loadStandardServers();

  // Re-stringify with indenting for nicer diffs
  const result = saveAllServers();
  expect(JSON.stringify(JSON.parse(result), null, 2)).toMatchSnapshot();
});

test("load/saveAllServers pruning RunningScripts", () => {
  // Feed a JSON object through loadAllServers/saveAllServers.
  // The object is a pruned set of servers that was extracted from a real (dev) game.

  loadStandardServers();

  // Re-stringify with indenting for nicer diffs
  Settings.ExcludeRunningScriptsFromSave = true;
  const result = saveAllServers();
  expect(JSON.stringify(JSON.parse(result), null, 2)).toMatchSnapshot();
});

// This function interacts with most of the game mechanics in some way to create a state that will exercise most of our
// save/load functionality.
function initTestSaveData() {
  const ns = getNS();
  ns.write("foo.txt", "foo", "w");
  ns.write("foo.js", "foo", "w");
  const script = Player.getHomeComputer().scripts.get("foo.js" as ScriptFilePath);
  if (!script) {
    throw new Error("Cannot find foo.js");
  }
  script.metadata.btime = 946684800000;

  ns.codingcontract.createDummyContract("Find Largest Prime Factor", "home");

  Player.moneySourceA.hacking = 1000;
  Player.moneySourceB.hacking = 1000;

  ns.stock.buyStock("ECP", 1000);
  ns.stock.placeOrder("ECP", 1, 500, "Limit Buy Order", "L");

  ns.stanek.acceptGift();
  ns.stanek.placeFragment(1, 2, 3, 5);

  ns.bladeburner.joinBladeburnerDivision();
  const bladeburner = Player.bladeburner;
  if (!bladeburner) {
    throw new Error("Bladeburner object is null");
  }
  bladeburner.rank = 1e9;
  bladeburner.skillPoints = 1e9;
  ns.bladeburner.startAction("General", "Training");
  bladeburner.cities["Sector-12"].pop = 2e9;
  bladeburner.cities["Sector-12"].popEst = 3e9;
  ns.bladeburner.upgradeSkill("Hyperdrive", 1000);
  bladeburner.operations.Assassination.count = 1000;

  ns.corporation.createCorporation("Corp", true);
  ns.corporation.expandIndustry("Agriculture", "Agriculture");
  const division = Player.corporation?.divisions.get("Agriculture");
  if (!division) {
    throw new Error("Division object is null");
  }
  division.researchPoints = 1000;
  const office = division.offices["Sector-12"];
  if (!office) {
    throw new Error("Office object is null");
  }
  office.size = 1000;
  const warehouse = division.warehouses["Sector-12"];
  if (!warehouse) {
    throw new Error("Warehouse object is null");
  }
  warehouse.size = 1000;
  warehouse.materials.Water.productionLimit = 1000;

  Player.karma = -54000;
  joinFaction(Factions["Slum Snakes"]);
  ns.gang.createGang("Slum Snakes");
  ns.gang.recruitMember("0");
  const gang = Player.gang;
  if (!gang) {
    throw new Error("Gang object is null");
  }
  ns.gang.setMemberTask("0", "Train Combat");
  const member = gang.members[0];
  member.gainExperience(1);
  ns.gang.purchaseEquipment("0", "Baseball Bat");
  ns.gang.purchaseEquipment("0", "Bionic Arms");
  AllGangs["Slum Snakes"].power = 1000;

  ns.hacknet.upgradeRam(0);
  Player.hashManager.hashes = 500;
  Player.hashManager.capacity = 1000;
  ns.hacknet.spendHashes("Sell for Money");

  Go.currentGame.cheatCount = 1000;

  DarknetState.storedCycles = 1000;

  InfiltrationState.lastChangeTimestamp = 946684800000;

  Companies["ECorp"].playerReputation = 1000;
  Factions["Slum Snakes"].playerReputation = 1000;
  ns.ui.alias("foo", "bar");
  ns.ui.alias("fooGlobal", "barGlobal", true);
  Settings.AutosaveInterval = 1000;
}

function checkTestSaveData(isDataLoadedFromSaveFile: boolean) {
  expect(Player.getHomeComputer().textFiles.get("foo.txt" as TextFilePath)?.text).toBe("foo");
  const script = Player.getHomeComputer().scripts.get("foo.js" as ScriptFilePath);
  if (!script) {
    throw new Error("Cannot find foo.js");
  }
  expect(script.code).toBe("foo");
  expect(script.metadata.btime).toBe(946684800000);

  expect(Player.getHomeComputer().contracts[0].getType()).toBe("Find Largest Prime Factor");

  expect(Player.moneySourceA.hacking).toBe(1000);
  expect(Player.moneySourceB.hacking).toBe(1000);

  expect(StockMarket["ECorp"].playerShares).toBe(1000);
  expect(StockMarket.Orders["ECP"][0].price).toBe(500);

  const fragment = staneksGift.fragments[0];
  expect(fragment.x).toBe(1);
  expect(fragment.y).toBe(2);
  expect(fragment.rotation).toBe(3);
  expect(fragment.id).toBe(5);

  const bladeburner = Player.bladeburner;
  if (!bladeburner) {
    throw new Error("Bladeburner object is null");
  }
  expect(bladeburner.rank).toBe(1e9);
  expect(bladeburner.skillPoints).toBe(998750250);
  expect(bladeburner.action?.type).toBe("General");
  expect(bladeburner.action?.name).toBe("Training");
  expect(bladeburner.cities["Sector-12"].pop).toBe(2e9);
  expect(bladeburner.cities["Sector-12"].popEst).toBe(3e9);
  expect(bladeburner.skills.Hyperdrive).toBe(1000);
  expect(bladeburner.operations.Assassination.count).toBe(1000);

  expect(Player.corporation?.divisions.get("Agriculture")?.researchPoints).toBe(1000);
  expect(Player.corporation?.divisions.get("Agriculture")?.offices["Sector-12"]?.size).toBe(1000);
  expect(Player.corporation?.divisions.get("Agriculture")?.warehouses["Sector-12"]?.size).toBe(1000);
  expect(
    Player.corporation?.divisions.get("Agriculture")?.warehouses["Sector-12"]?.materials.Water.productionLimit,
  ).toBe(1000);

  const gang = Player.gang;
  if (!gang) {
    throw new Error("Gang object is null");
  }
  const member = gang.members[0];
  expect(member.task).toBe("Train Combat");
  expect(member.str_exp).toBeGreaterThan(1);
  expect(member.str_mult).toBeGreaterThan(1);
  expect(member.upgrades[0]).toBe("Baseball Bat");
  expect(member.augmentations[0]).toBe("Bionic Arms");
  expect(AllGangs["Slum Snakes"].power).toBe(1000);

  const hacknetServer = GetServerOrThrow("hacknet-server-0");
  expect(hacknetServer.maxRam).toBe(2);
  expect(Player.hashManager.capacity).toBe(1000);
  expect(Player.hashManager.upgrades["Sell for Money"]).toBe(1);

  expect(Go.currentGame.cheatCount).toBe(1000);

  if (isDataLoadedFromSaveFile) {
    expect(DarknetState.storedCycles).toBe(841);
  } else {
    expect(DarknetState.storedCycles).toBe(1000);
  }

  expect(InfiltrationState.lastChangeTimestamp).toBe(946684800000);

  expect(Companies["ECorp"].playerReputation).toBe(1000);
  expect(Factions["Slum Snakes"].playerReputation).toBe(1000);
  expect(Aliases.get("foo")).toBe("bar");
  expect(GlobalAliases.get("fooGlobal")).toBe("barGlobal");
  expect(Settings.AutosaveInterval).toBe(1000);
}

// This functions in a complementary way to the snapshot tests we have above and in FullSave.test. The snapshot tests
// check for an exact save format result, but are more rigid and less comprehensive as a result. These tests check the
// result after loading, which both tests the load system and allows for more flexible tests. Both are important.
describe("Save/Load system", () => {
  beforeAll(() => {
    initGameEnvironment();
    jest.useRealTimers();
  });
  beforeEach(() => {
    setupBasicTestingEnvironment();
    for (const sf of validBitNodes) {
      Player.sourceFiles.set(sf, 3);
    }
    const ns = getNS();
    ns.singularity.b1tflum3(1);
    Player.money = 1e100;
    Player.gainHackingExp(1e9);
    Player.gainStrengthExp(1e9);
    Player.gainDefenseExp(1e9);
    Player.gainDexterityExp(1e9);
    Player.gainAgilityExp(1e9);
    Player.gainCharismaExp(1e9);
  });
  test("Load v3.0.1 save file", async () => {
    await loadGame(fs.readFileSync("test/jest/save-files/v3.0.1.gz"));
    checkTestSaveData(true);
  });
  test("Most mechanics", async () => {
    initTestSaveData();
    await loadGame(await getSaveData());
    checkTestSaveData(false);
  });
  test.each([
    [
      "ClassWork-University",
      () => getNS().singularity.universityCourse("Rothman University", "Computer Science"),
      () => expect((Player.currentWork as ClassWork).location).toBe("Rothman University"),
    ],
    [
      "ClassWork-Gym",
      () => getNS().singularity.gymWorkout("Powerhouse Gym", "str"),
      () => expect((Player.currentWork as ClassWork).location).toBe("Powerhouse Gym"),
    ],
    [
      "CompanyWork",
      () => {
        const ns = getNS();
        ns.singularity.applyToCompany("Joe's Guns", "Employee");
        ns.singularity.workForCompany("Joe's Guns");
      },
      () => expect((Player.currentWork as CompanyWork).companyName).toBe("Joe's Guns"),
    ],
    [
      "CreateProgramWork",
      () => {
        Player.gainHackingExp(1e9);
        getNS().singularity.createProgram("BruteSSH.exe");
      },
      () => expect((Player.currentWork as CreateProgramWork).programName).toBe("BruteSSH.exe"),
    ],
    [
      "CrimeWork",
      () => getNS().singularity.commitCrime("Mug"),
      () => expect((Player.currentWork as CrimeWork).crimeType).toBe("Mug"),
    ],
    [
      "FactionWork",
      () => {
        joinFaction(Factions.ECorp);
        getNS().singularity.workForFaction("ECorp", "hacking");
      },
      () => expect((Player.currentWork as FactionWork).factionName).toBe("ECorp"),
    ],
    [
      "GraftingWork",
      () => {
        const ns = getNS();
        ns.singularity.travelToCity("New Tokyo");
        ns.grafting.graftAugmentation("QLink");
      },
      () => expect((Player.currentWork as GraftingWork).augmentation).toBe("QLink"),
    ],
    [
      "SleeveBladeburnerWork",
      () => {
        Player.startBladeburner();
        getNS().sleeve.setToBladeburnerAction(0, "Training");
      },
      () => expect((Player.sleeves[0].currentWork as SleeveBladeburnerWork).actionId.name).toBe("Training"),
    ],
    [
      "SleeveClassWork-University",
      () => getNS().sleeve.setToUniversityCourse(0, "Rothman University", "Computer Science"),
      () => expect((Player.sleeves[0].currentWork as SleeveClassWork).location).toBe("Rothman University"),
    ],
    [
      "SleeveClassWork-Gym",
      () => getNS().sleeve.setToGymWorkout(0, "Powerhouse Gym", "str"),
      () => expect((Player.sleeves[0].currentWork as SleeveClassWork).location).toBe("Powerhouse Gym"),
    ],
    [
      "SleeveCompanyWork",
      () => {
        const ns = getNS();
        ns.singularity.applyToCompany("Joe's Guns", "Employee");
        ns.sleeve.setToCompanyWork(0, "Joe's Guns");
      },
      () => expect((Player.sleeves[0].currentWork as SleeveCompanyWork).companyName).toBe("Joe's Guns"),
    ],
    [
      "SleeveCrimeWork",
      () => getNS().sleeve.setToCommitCrime(0, "Mug"),
      () => expect((Player.sleeves[0].currentWork as SleeveCrimeWork).crimeType).toBe("Mug"),
    ],
    [
      "SleeveFactionWork",
      () => {
        joinFaction(Factions.ECorp);
        getNS().sleeve.setToFactionWork(0, "ECorp", "hacking");
      },
      () => expect((Player.sleeves[0].currentWork as SleeveFactionWork).factionName).toBe("ECorp"),
    ],
    [
      "SleeveInfiltrateWork",
      () => {
        Player.startBladeburner();
        getNS().sleeve.setToBladeburnerAction(0, "Infiltrate Synthoids");
      },
      () => expect((Player.sleeves[0].currentWork as SleeveInfiltrateWork).type).toBe("INFILTRATE"),
    ],
    [
      "SleeveRecoveryWork",
      () => getNS().sleeve.setToShockRecovery(0),
      () => expect((Player.sleeves[0].currentWork as SleeveRecoveryWork).type).toBe("RECOVERY"),
    ],
    [
      "SleeveSupportWork",
      () => {
        Player.startBladeburner();
        getNS().sleeve.setToBladeburnerAction(0, "Support main sleeve");
      },
      () => expect((Player.sleeves[0].currentWork as SleeveSupportWork).type).toBe("SUPPORT"),
    ],
    [
      "SleeveSynchroWork",
      () => getNS().sleeve.setToSynchronize(0),
      () => expect((Player.sleeves[0].currentWork as SleeveSynchroWork).type).toBe("SYNCHRO"),
    ],
  ])("%s", async (_, initTestSaveData, checkTestSaveData) => {
    initTestSaveData();
    await loadGame(await getSaveData());
    checkTestSaveData();
  });
});
