import "../../src/Player";

import { loadAllServers, saveAllServers } from "../../src/Server/AllServers";
import { loadAllRunningScripts } from "../../src/NetscriptWorker";
import { Settings } from "../../src/Settings/Settings";
import { Player, setPlayer } from "../../src/Player";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
jest.useFakeTimers();

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
                "code": "/** @param {NS} ns */\\nexport async function main(ns) {\\n  return ns.asleep(1000000);\\n}",
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
        "n00dles"
      ],
      "purchasedByPlayer": true
    }
  },
  "n00dles": {
    "ctor": "Server",
    "data": {
      "hostname": "n00dles",
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
