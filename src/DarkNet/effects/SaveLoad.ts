import { DarknetState } from "../models/DarknetState";
import { assertObject } from "../../utils/TypeAssertion";

export type DarknetSaveFormat = {
  storedCycles: number;
  hasUsedHeartbleed: boolean;
};

export function getDarkNetSave(): DarknetSaveFormat {
  return {
    storedCycles: Math.floor(DarknetState.storedCycles),
    hasUsedHeartbleed: DarknetState.hasUsedHeartbleed,
  };
}

export function loadDarkNet(saveString: unknown): void {
  if (saveString == null || typeof saveString !== "string" || saveString === "") {
    return;
  }
  try {
    const parsedData: unknown = JSON.parse(saveString);
    assertObject(parsedData);
    const { storedCycles, hasUsedHeartbleed } = parsedData;
    if (typeof storedCycles !== "number" || !Number.isFinite(storedCycles)) {
      throw new Error(`Invalid storedCycles: ${storedCycles}`);
    }
    DarknetState.storedCycles = storedCycles < 0 ? 0 : storedCycles;
    DarknetState.hasUsedHeartbleed = Boolean(hasUsedHeartbleed);
  } catch (error) {
    console.error(error);
    console.error("Invalid DarkNet data:", saveString);
  }
}
