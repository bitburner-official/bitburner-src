import { Player } from "@player";
import fs from "node:fs";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { loadGame, saveObject } from "../../../src/SaveObject";
import * as db from "../../../src/db";
import * as FileUtils from "../../../src/utils/FileUtils";
import type { SaveData } from "../../../src/types";
import { calculateExp } from "../../../src/PersonObjects/formulas/skill";

async function loadGameFromSaveData(saveData: SaveData) {
  // Simulate loading the data in IndexedDB
  const mockedLoad = jest.spyOn(db, "load");
  // We must use structuredClone(saveData) instead of saveData; otherwise, the check of mockedDownload won't catch wrong
  // changes in evaluateVersionCompatibility (e.g., unexpectedly mutating saveData before passing it to
  // downloadContentAsFile).
  mockedLoad.mockReturnValue(Promise.resolve(structuredClone(saveData)));

  // Simulate saving the data in IndexedDB
  jest.spyOn(db, "save").mockImplementation(() => Promise.resolve());

  const mockedDownload = jest.spyOn(FileUtils, "downloadContentAsFile").mockImplementation(() => {});

  await loadGame(saveData);

  return mockedDownload;
}

describe("v3", () => {
  test("v2.8.1 to v3.0.0", async () => {
    const saveData = new Uint8Array(fs.readFileSync("test/jest/Migration/save-files/v2.8.1.gz"));
    const mockedDownload = await loadGameFromSaveData(saveData);

    // Check if auto-migration works
    expect(
      Player.getHomeComputer()
        .scripts.get("a.js" as ScriptFilePath)
        ?.code.includes("ns.ui.openTail()"),
    ).toStrictEqual(true);
    if (!Player.corporation) {
      throw new Error("The save file does not have corporation data");
    }
    expect(Object.keys(Player.corporation.upgrades).includes("DreamSense")).toStrictEqual(false);
    expect(Player.corporation.funds).toStrictEqual(110e9);

    // Check if evaluateVersionCompatibility correctly loads the data in IndexedDB and passes it to downloadContentAsFile
    expect(mockedDownload).toHaveBeenCalledWith(saveData, "bitburnerSave_backup_2.8.1_1756913326.json.gz");
  });

  test.each([
    ["test/jest/Migration/save-files/v2.8.1_500int.gz", 1773597870229, 1773597871370, undefined, 500, 300],
    ["test/jest/Migration/save-files/v2.8.1_500int_override_100int.gz", 1773597926723, 1773597928370, 100, 500, 300],
    ["test/jest/Migration/save-files/v2.8.1_500int_override_1000int.gz", 1773597951205, 1773597953370, 1000, 500, 300],
  ])("%s", async (path, lastSave, lastUpdate, intelligenceOverride, playerInt, sleeveInt) => {
    const saveData = new Uint8Array(fs.readFileSync(path));
    const mockedDownload = await loadGameFromSaveData(saveData);
    expect(Player.lastSave).toStrictEqual(lastSave);

    const playerIntExp =
      intelligenceOverride !== undefined && intelligenceOverride < playerInt
        ? calculateExp(intelligenceOverride, 1)
        : calculateExp(playerInt, 1);
    const sleeveIntExp =
      intelligenceOverride !== undefined && intelligenceOverride < sleeveInt
        ? calculateExp(intelligenceOverride, 1)
        : calculateExp(sleeveInt, 1);
    const persistentPlayerIntExp = calculateExp(playerInt, 1);
    const persistentSleeveIntExp = calculateExp(sleeveInt, 1);

    // Check if Player.exp.intelligence and Player.persistentIntelligenceData.exp are migrated.
    expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(intelligenceOverride);
    expect(Player.exp.intelligence).toStrictEqual(playerIntExp);
    expect(Player.persistentIntelligenceData.exp).toStrictEqual(persistentPlayerIntExp);
    for (const sleeve of Player.sleeves) {
      expect(sleeve.exp.intelligence).toStrictEqual(sleeveIntExp);
      expect(sleeve.persistentIntelligenceData.exp).toStrictEqual(persistentSleeveIntExp);
    }

    const expGain = 1e9;
    // Gain exp and check if it is accumulated correctly.
    Player.gainIntelligenceExp(expGain);
    expect(Player.exp.intelligence).toStrictEqual(playerIntExp + expGain);
    expect(Player.persistentIntelligenceData.exp).toStrictEqual(persistentPlayerIntExp + expGain);
    for (const sleeve of Player.sleeves) {
      sleeve.gainIntelligenceExp(expGain);
      expect(sleeve.exp.intelligence).toStrictEqual(sleeveIntExp + expGain);
      expect(sleeve.persistentIntelligenceData.exp).toStrictEqual(persistentSleeveIntExp + expGain);
    }

    // Save and reload.
    await saveObject.saveGame();
    await loadGameFromSaveData(await saveObject.getSaveData());
    expect(Player.lastSave).not.toStrictEqual(lastSave);

    // Check if gained exp is saved correctly.
    expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(intelligenceOverride);
    expect(Player.exp.intelligence).toStrictEqual(playerIntExp + expGain);
    expect(Player.persistentIntelligenceData.exp).toStrictEqual(persistentPlayerIntExp + expGain);
    for (const sleeve of Player.sleeves) {
      expect(sleeve.exp.intelligence).toStrictEqual(sleeveIntExp + expGain);
      expect(sleeve.persistentIntelligenceData.exp).toStrictEqual(persistentSleeveIntExp + expGain);
    }

    expect(mockedDownload).toHaveBeenCalledWith(
      saveData,
      `bitburnerSave_backup_2.8.1_${Math.round(lastUpdate / 1000)}.json.gz`,
    );
  });

  describe("Intelligence migration bug", () => {
    test("No change in exp and skill level", async () => {
      const saveData = new Uint8Array(fs.readFileSync("test/jest/Migration/save-files/v2.8.1_SF1.1_SF10.3.gz"));
      const mockedDownload = await loadGameFromSaveData(saveData);

      for (const person of [Player, ...Player.sleeves]) {
        expect(person.persistentIntelligenceData.exp).toStrictEqual(0);
        expect(person.exp.intelligence).toStrictEqual(0);
        expect(person.skills.intelligence).toStrictEqual(0);
      }

      expect(mockedDownload).toHaveBeenCalledWith(saveData, "bitburnerSave_backup_2.8.1_1776173824.json.gz");
    });
    test("Reset wrong exp and skill level", async () => {
      const saveData = new Uint8Array(fs.readFileSync("test/jest/Migration/save-files/v3.0.0_int_migration_bug.gz"));
      const mockedDownload = await loadGameFromSaveData(saveData);

      for (const person of [Player, ...Player.sleeves]) {
        expect(person.persistentIntelligenceData.exp).toStrictEqual(0);
        expect(person.exp.intelligence).toStrictEqual(0);
        expect(person.skills.intelligence).toStrictEqual(0);
      }

      expect(mockedDownload).not.toHaveBeenCalled();
    });
  });
});
