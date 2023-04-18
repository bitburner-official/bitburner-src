/* eslint-disable no-await-in-loop */

import { Player } from "../../../src/Player";
import { getTabCompletionPossibilities } from "../../../src/Terminal/getTabCompletionPossibilities";
import { Server } from "../../../src/Server/Server";
import { AddToAllServers, prestigeAllServers } from "../../../src/Server/AllServers";
import { LocationName } from "../../../src/Enums";
import { CodingContract } from "../../../src/CodingContracts";
import { initDarkWebItems } from "../../../src/DarkWeb/DarkWebItems";
import { resolveTextFilePath } from "../../../src/Paths/TextFilePath";
import { resolveScriptFilePath } from "../../../src/Paths/ScriptFilePath";

const exampleTxtPath = resolveTextFilePath("note.txt");
if (!exampleTxtPath) throw new Error("could not resolve");
const exampleTxtPath2 = resolveTextFilePath("www/note.txt");
if (!exampleTxtPath2) throw new Error("could not resolve");
const exampleScriptPath = resolveScriptFilePath("www/script.js");
if (!exampleScriptPath) throw new Error("could not resolve");

describe("getTabCompletionPossibilities", function () {
  let closeServer: Server;
  let farServer: Server;

  beforeEach(() => {
    prestigeAllServers();
    initDarkWebItems();
    Player.init();

    closeServer = new Server({
      ip: "8.8.8.8",
      hostname: "near",
      hackDifficulty: 1,
      moneyAvailable: 70000,
      numOpenPortsRequired: 0,
      organizationName: LocationName.NewTokyoNoodleBar,
      requiredHackingSkill: 1,
      serverGrowth: 3000,
    });
    farServer = new Server({
      ip: "4.4.4.4",
      hostname: "far",
      hackDifficulty: 1,
      moneyAvailable: 70000,
      numOpenPortsRequired: 0,
      organizationName: LocationName.Sector12JoesGuns,
      requiredHackingSkill: 1,
      serverGrowth: 3000,
    });
    Player.getHomeComputer().serversOnNetwork.push(closeServer.hostname);
    closeServer.serversOnNetwork.push(Player.getHomeComputer().hostname);
    closeServer.serversOnNetwork.push(farServer.hostname);
    farServer.serversOnNetwork.push(closeServer.hostname);
    AddToAllServers(closeServer);
    AddToAllServers(farServer);
  });

  it("completes the connect command", async () => {
    const options = await getTabCompletionPossibilities("connect ", 0);
    expect(options).toEqual(["near"]);
  });

  it("completes the buy command", async () => {
    const options = await getTabCompletionPossibilities("buy ", 0);
    expect(options.sort()).toEqual(
      [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe",
        "DeepscanV1.exe",
        "DeepscanV2.exe",
        "AutoLink.exe",
        "ServerProfiler.exe",
        "Formulas.exe",
      ].sort(),
    );
  });

  it("completes the scp command", async () => {
    Player.getHomeComputer().writeToTextFile(exampleTxtPath, "oh hai mark");
    Player.getHomeComputer().messages.push("af.lit" as Server["messages"][number]);
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath as any, "oh hai mark");
    const options1 = await getTabCompletionPossibilities("scp ", 0);
    expect(options1).toEqual(["www/script.js", "af.lit", "note.txt", "www/"]);

    const options2 = await getTabCompletionPossibilities("scp note.txt ", 1);
    expect(options2).toEqual(["home", "near", "far"]);
  });

  it("completes the kill, tail, mem, and check commands", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    for (const command of ["kill", "tail", "mem", "check"]) {
      const options = await getTabCompletionPossibilities(`${command} `, 0);
      expect(options).toEqual(["www/script.js", "www/"]);
    }
  });

  it("completes the nano commands", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    Player.getHomeComputer().writeToTextFile(exampleTxtPath, "oh hai mark");
    const options = await getTabCompletionPossibilities("nano ", 0);
    expect(options).toEqual(["www/script.js", "note.txt", "www/"]);
  });

  it("completes the rm command", async () => {
    Player.getHomeComputer().writeToTextFile(exampleTxtPath, "oh hai mark");
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    Player.getHomeComputer().contracts.push(new CodingContract("linklist.cct"));
    Player.getHomeComputer().messages.push("asl.msg" as Server["messages"][number]);
    Player.getHomeComputer().messages.push("af.lit" as Server["messages"][number]);
    const options = await getTabCompletionPossibilities("rm ", 0);
    expect(options).toEqual(["www/script.js", "NUKE.exe", "af.lit", "note.txt", "linklist.cct", "www/"]);
  });

  it("completes the run command", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    Player.getHomeComputer().contracts.push(new CodingContract("linklist.cct"));
    const options = await getTabCompletionPossibilities("run ", 0);
    expect(options).toEqual(["www/script.js", "NUKE.exe", "linklist.cct", "www/"]);
  });

  it("completes the cat command", async () => {
    Player.getHomeComputer().writeToTextFile(exampleTxtPath2, "oh hai mark");
    Player.getHomeComputer().messages.push("asl.msg" as Server["messages"][number]);
    Player.getHomeComputer().messages.push("af.lit" as Server["messages"][number]);
    const options = await getTabCompletionPossibilities("cat ", 0);
    expect(options).toEqual(["asl.msg", "af.lit", "www/note.txt", "www/"]);
  });

  it("completes the download and mv commands", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    Player.getHomeComputer().writeToTextFile(exampleTxtPath, "oh hai mark");
    for (const command of ["download", "mv"]) {
      const options = await getTabCompletionPossibilities(`${command} `, 0);
      expect(options).toEqual(["www/script.js", "note.txt", "www/"]);
    }
  });

  it("completes the cd command", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    const options = await getTabCompletionPossibilities("cd ", 0);
    expect(options).toEqual(["www/"]);
  });

  it("completes the ls and cd commands", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    for (const command of ["ls", "cd"]) {
      const options = await getTabCompletionPossibilities(`${command} `, 0);
      expect(options).toEqual(["www/"]);
    }
  });

  it("completes commands starting with ./", async () => {
    Player.getHomeComputer().writeToScriptFile(exampleScriptPath, "oh hai mark");
    const options = await getTabCompletionPossibilities("run ./", 0);
    expect(options).toEqual(["./www/script.js", "NUKE.exe", "./www/"]);
  });
});
