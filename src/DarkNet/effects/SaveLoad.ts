import { DarknetState } from "../models/DarknetState";

export type DarknetSaveFormat = {
  bonusCycles: number;
};

export function getDarkNetSave(): DarknetSaveFormat {
  return {
    bonusCycles: Math.floor(DarknetState.bonusCycles),
  };
}

export function loadDarkNet(data: unknown) {
  /** Function for ending the loading process, showing an error if there is one, and indicating load success/failure */
  function showError(error: unknown): boolean {
    console.warn("Encountered the following issue while loading Darknet savedata:");
    console.error(error);
    console.warn("Savedata:");
    console.error(data);
    return true; // the default state will work fine if something goes wrong, or if no existing save is present
  }
  if (!data) return showError("There was no Darknet savedata");
  // Parsing the savedata
  if (typeof data !== "string") return showError("Savedata was not a string");
  let parsedData;
  try {
    parsedData = JSON.parse(data) as unknown;
  } catch (e) {
    return showError(`Cannot JSON.parse the savedata: ${data}`);
  }
  if (!parsedData || typeof parsedData !== "object") return showError("Parsed savedata was not an object");
  if (!Object.keys(parsedData).includes("bonusCycles")) return showError("Parsed savedata was missing bonusCycles");
  const bonusTime: number = +(parsedData as DarknetSaveFormat).bonusCycles;
  if (isNaN(bonusTime)) return showError("Parsed savedata bonusCycles was not a number");

  DarknetState.bonusCycles = bonusTime < 0 ? 0 : bonusTime;
}
