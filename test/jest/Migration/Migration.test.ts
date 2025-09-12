import { Player } from "@player";
import fs from "node:fs";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { loadGame } from "../../../src/SaveObject";
import * as db from "../../../src/db";
import * as FileUtils from "../../../src/utils/FileUtils";

describe("v3", () => {
  test("v2.8.1 to v3.0.0", async () => {
    const saveData = new Uint8Array(fs.readFileSync("test/jest/Migration/save-files/v2.8.1.gz"));

    // Simulate loading the data in IndexedDB
    const mockedLoad = jest.spyOn(db, "load");
    /**
     * We must use structuredClone(saveData) instead of saveData; otherwise, the check of mockedDownload won't catch
     * wrong changes in evaluateVersionCompatibility (e.g., unexpectedly mutating saveData before passing it to
     * downloadContentAsFile).
     */
    mockedLoad.mockReturnValue(Promise.resolve(structuredClone(saveData)));

    const mockedDownload = jest.spyOn(FileUtils, "downloadContentAsFile");

    await loadGame(await db.load());

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
});
