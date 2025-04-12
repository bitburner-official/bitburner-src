/* eslint-disable no-await-in-loop */

import { Player } from "../../../src/Player";
import { getTabCompletionPossibilities } from "../../../src/Terminal/getTabCompletionPossibilities";
import { Server } from "../../../src/Server/Server";
import { AddToAllServers, prestigeAllServers } from "../../../src/Server/AllServers";
import { LocationName } from "../../../src/Enums";
import { CodingContract } from "../../../src/CodingContract/Contract";
import { asFilePath } from "../../../src/Paths/FilePath";
import { Directory, isAbsolutePath, isDirectoryPath, root } from "../../../src/Paths/Directory";
import { hasTextExtension } from "../../../src/Paths/TextFilePath";
import { hasScriptExtension } from "../../../src/Paths/ScriptFilePath";
import { LiteratureName, MessageFilename } from "../../../src/Enums";
import { Terminal } from "../../../src/Terminal";
import { IPAddress } from "../../../src/Types/strings";

describe("getTabCompletionPossibilities", function () {
  let closeServer: Server;
  let farServer: Server;

  beforeEach(() => {
    prestigeAllServers();
    Player.init();

    closeServer = new Server({
      ip: "8.8.8.8" as IPAddress,
      hostname: "near",
      hackDifficulty: 1,
      moneyAvailable: 70000,
      numOpenPortsRequired: 0,
      organizationName: LocationName.NewTokyoNoodleBar,
      requiredHackingSkill: 1,
      serverGrowth: 3000,
    });
    farServer = new Server({
      ip: "4.4.4.4" as IPAddress,
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

  it("completes the connect command, regardless of folder", async () => {
    let options = await getTabCompletionPossibilities("connect ", root);
    expect(options).toEqual(["near"]);
    options = await getTabCompletionPossibilities("connect ", asDirectory("folder1/"));
    expect(options).toEqual(["near"]);
    Terminal.connectToServer("near");
    options = await getTabCompletionPossibilities("connect ", root);
    expect(options).toEqual(["home", "far"]);
    options = await getTabCompletionPossibilities("connect h", asDirectory("folder1/"));
    // Also test completion of a partially completed text
    expect(options).toEqual(["home"]);
  });

  it("completes the buy command", async () => {
    let options = await getTabCompletionPossibilities("buy ", root);
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
    // Also test that darkweb items will be completed if they have incorrect capitalization in progress
    options = await getTabCompletionPossibilities("buy de", root);
    expect(options.sort()).toEqual(["DeepscanV1.exe", "DeepscanV2.exe"].sort());
  });

  it("completes the scp command", async () => {
    writeFiles();
    let options = await getTabCompletionPossibilities("scp ", root);
    const filesToMatch = [
      "note.txt",
      "folder1/text.txt",
      "folder1/text2.txt",
      "hack.js",
      "weaken.js",
      "grow.js",
      "old.script",
      "folder1/test.js",
      "anotherFolder/win.js",
      LiteratureName.AGreenTomorrow,
    ];
    expect(options.sort()).toEqual(filesToMatch.sort());
    // Test the second command argument (server name)
    options = await getTabCompletionPossibilities("scp note.txt ", root);
    expect(options.sort()).toEqual(["home", "near", "far", ...filesToMatch].sort());
  });

  it("completes the kill, tail, mem, and check commands", async () => {
    writeFiles();
    for (const command of ["kill", "tail", "mem", "check"]) {
      let options = await getTabCompletionPossibilities(`${command} `, root);
      expect(options.sort()).toEqual(scriptFilePaths);
      // From a directory, show only the options in that directory
      options = await getTabCompletionPossibilities(`${command} `, asDirectory("folder1/"));
      expect(options.sort()).toEqual(["test.js"]);
      // From a directory but with relative path .., show stuff in the resolved directory with the relative pathing included
      options = await getTabCompletionPossibilities(`${command} ../`, asDirectory("folder1/"));
      expect(options.sort()).toEqual(
        [...scriptFilePaths.map((path) => "../" + path), "../folder1/", "../anotherFolder/"].sort(),
      );
      options = await getTabCompletionPossibilities(`${command} ../folder1/../anotherFolder/`, asDirectory("folder1/"));
      expect(options.sort()).toEqual(["../folder1/../anotherFolder/win.js"]);
    }
  });

  it("completes the nano commands", async () => {
    writeFiles();
    const contentFilePaths = [...scriptFilePaths, ...textFilePaths].sort();
    const options = await getTabCompletionPossibilities("nano ", root);
    expect(options.sort()).toEqual(contentFilePaths);
  });

  it("completes the rm command", async () => {
    writeFiles();
    const removableFilePaths = [
      ...scriptFilePaths,
      ...textFilePaths,
      ...contractFilePaths,
      LiteratureName.AGreenTomorrow,
      "NUKE.exe",
    ].sort();
    const options = await getTabCompletionPossibilities("rm ", root);
    expect(options.sort()).toEqual(removableFilePaths);
  });

  it("completes the run command", async () => {
    writeFiles();
    const runnableFilePaths = [...scriptFilePaths, ...contractFilePaths, "NUKE.exe"].sort();
    let options = await getTabCompletionPossibilities("run ", root);
    expect(options.sort()).toEqual(runnableFilePaths);
    // Also check the same files
    options = await getTabCompletionPossibilities("./", root);
    expect(options.sort()).toEqual(
      [...runnableFilePaths.map((path) => "./" + path), "./folder1/", "./anotherFolder/"].sort(),
    );
  });

  it("completes the cat command", async () => {
    writeFiles();
    const cattableFilePaths = [
      ...scriptFilePaths,
      ...textFilePaths,
      MessageFilename.TruthGazer,
      LiteratureName.AGreenTomorrow,
    ].sort();
    const options = await getTabCompletionPossibilities("cat ", root);
    expect(options.sort()).toEqual(cattableFilePaths);
  });

  it("completes the download and mv commands", async () => {
    writeFiles();
    writeFiles();
    const contentFilePaths = [...scriptFilePaths, ...textFilePaths].sort();
    for (const command of ["download", "mv"]) {
      const options = await getTabCompletionPossibilities(`${command} `, root);
      expect(options.sort()).toEqual(contentFilePaths);
    }
  });

  it("completes the ls and cd commands", async () => {
    writeFiles();
    for (const command of ["ls", "cd"]) {
      const options = await getTabCompletionPossibilities(`${command} `, root);
      expect(options.sort()).toEqual(["folder1/", "anotherFolder/"].sort());
    }
  });
});

function asDirectory(dir: string): Directory {
  if (!isAbsolutePath(dir) || !isDirectoryPath(dir)) throw new Error(`Directory ${dir} failed typechecking`);
  return dir;
}
const textFilePaths = ["note.txt", "folder1/text.txt", "folder1/text2.txt"];
const scriptFilePaths = [
  "hack.js",
  "weaken.js",
  "grow.js",
  "old.script",
  "folder1/test.js",
  "anotherFolder/win.js",
].sort();
const contractFilePaths = ["testContract.cct", "anothercontract.cct"];
function writeFiles() {
  const home = Player.getHomeComputer();
  for (const filename of textFilePaths) {
    if (!hasTextExtension(filename)) {
      throw new Error(`Text file ${filename} had the wrong extension.`);
    }
    home.writeToTextFile(asFilePath(filename), `File content for ${filename}`);
  }
  for (const filename of scriptFilePaths) {
    if (!hasScriptExtension(filename)) {
      throw new Error(`Script file ${filename} had the wrong extension.`);
    }
    home.writeToScriptFile(asFilePath(filename), `File content for ${filename}`);
  }
  for (const filename of contractFilePaths) {
    home.contracts.push(new CodingContract(filename));
  }
  home.messages.push(LiteratureName.AGreenTomorrow, MessageFilename.TruthGazer);
}
