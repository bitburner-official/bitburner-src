import { DarknetState } from "../models/DarknetState";
import { assertObject } from "../../utils/TypeAssertion";

export type DarknetSaveFormat = {
  storedCycles: number;
  hasUsedHeartbleed: boolean;
  phishingRewardCount: number;
};

export function getDarkNetSave(): DarknetSaveFormat {
  return {
    storedCycles: Math.floor(DarknetState.storedCycles),
    hasUsedHeartbleed: DarknetState.hasUsedHeartbleed,
    phishingRewardCount: DarknetState.phishingRewardCount,
  };
}

export function loadDarkNet(saveString: unknown): void {
  if (saveString == null || typeof saveString !== "string" || saveString === "") {
    return;
  }
  try {
    const parsedData: unknown = JSON.parse(saveString);
    assertObject(parsedData);
    const { storedCycles, hasUsedHeartbleed, phishingRewardCount } = parsedData;
    if (typeof storedCycles !== "number" || !Number.isFinite(storedCycles)) {
      throw new Error(`Invalid storedCycles: ${storedCycles}`);
    }
    DarknetState.storedCycles = storedCycles < 0 ? 0 : storedCycles;
    DarknetState.hasUsedHeartbleed = Boolean(hasUsedHeartbleed);
    DarknetState.phishingRewardCount = Math.max(Number(phishingRewardCount) || 0, 0);
  } catch (error) {
    console.error(error);
    console.error("Invalid DarkNet data:", saveString);
  }
}
