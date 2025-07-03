import { assertNumberArray } from "../utils/TypeAssertion";
import { cleanRecentInfiltrations, InfiltrationState } from "./formulas/game";

export function getRecentInfiltrations(): number[] {
  cleanRecentInfiltrations();
  return InfiltrationState.successfulInfiltrationTimestamps;
}

export function loadRecentInfiltrations(saveString: unknown): void {
  if (saveString == null || typeof saveString !== "string" || saveString === "") {
    InfiltrationState.successfulInfiltrationTimestamps = [];
    return;
  }
  try {
    const parsedData: unknown = JSON.parse(saveString);
    assertNumberArray(parsedData, true);
    InfiltrationState.successfulInfiltrationTimestamps = parsedData;
    cleanRecentInfiltrations();
  } catch (error) {
    console.error(error);
    console.error("Invalid recent infiltrations:", saveString);
    InfiltrationState.successfulInfiltrationTimestamps = [];
  }
}
