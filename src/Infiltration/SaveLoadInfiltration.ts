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
    const { floors, lastChangeTimestamp } = parsedData;
    if (typeof floors !== "number") {
      throw new Error("Invalid parsedData.floors");
    }
    if (typeof lastChangeTimestamp !== "number") {
      throw new Error("Invalid parsedData.lastChangeTimestamp");
    }
    InfiltrationState.floors = floors;
    InfiltrationState.lastChangeTimestamp = lastChangeTimestamp;
  } catch (error) {
    console.error(error);
    console.error("Invalid recent infiltrations:", saveString);
    Object.assign(InfiltrationState, InfiltrationStateDefault);
  }
}
