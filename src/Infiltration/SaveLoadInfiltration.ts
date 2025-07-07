import { assertObject } from "../utils/TypeAssertion";
import { InfiltrationState, InfiltrationStateDefault } from "./formulas/game";

export function loadInfiltrations(saveString: unknown): void {
  if (saveString == null || typeof saveString !== "string" || saveString === "") {
    Object.assign(InfiltrationState, InfiltrationStateDefault);
    return;
  }
  try {
    const parsedData: unknown = JSON.parse(saveString);
    assertObject(parsedData);
    const { infils, lastChangeTimestamp } = parsedData;
    if (typeof infils !== "number") {
      throw new Error("Invalid parsedData.infils");
    }
    if (typeof lastChangeTimestamp !== "number") {
      throw new Error("Invalid parsedData.lastChangeTimestamp");
    }
    InfiltrationState.infils = infils;
    InfiltrationState.lastChangeTimestamp = lastChangeTimestamp;
  } catch (error) {
    console.error(error);
    console.error("Invalid recent infiltrations:", saveString);
    Object.assign(InfiltrationState, InfiltrationStateDefault);
  }
}
