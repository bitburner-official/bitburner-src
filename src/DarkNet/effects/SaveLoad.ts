import { DarknetState } from "../models/DarknetState";
import { migrateLegacyImmobileServers } from "../controllers/NetworkGenerator";
import { assertObject } from "../../utils/TypeAssertion";

export type DarknetSaveFormat = {
  storedCycles: number;
};

export function getDarkNetSave(): DarknetSaveFormat {
  return {
    storedCycles: Math.floor(DarknetState.storedCycles),
  };
}

export function loadDarkNet(saveString: unknown): void {
  migrateLegacyImmobileServers();
  if (saveString == null || typeof saveString !== "string" || saveString === "") {
    return;
  }
  try {
    const parsedData: unknown = JSON.parse(saveString);
    assertObject(parsedData);
    const { storedCycles } = parsedData;
    if (typeof storedCycles !== "number" || !Number.isFinite(storedCycles)) {
      throw new Error(`Invalid storedCycles: ${storedCycles}`);
    }
    DarknetState.storedCycles = storedCycles < 0 ? 0 : storedCycles;
  } catch (error) {
    console.error(error);
    console.error("Invalid DarkNet data:", saveString);
  }
}
