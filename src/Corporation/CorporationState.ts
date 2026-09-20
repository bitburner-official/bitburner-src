import { CorpStateName } from "@nsdefs";
import { makeSerializable } from "../utils/GenericReviver";
import { stateNames } from "./data/Constants";

export class CorporationState {
  // Number representing what state the Corporation is in. The number
  // is an index for the array that holds all Corporation States
  state = 0;

  // Get the name of the current state
  // NOTE: This does NOT return the number stored in the 'state' property,
  // which is just an index for the array of all possible Corporation States.
  get nextName(): CorpStateName {
    return stateNames[this.state];
  }
  get prevName(): CorpStateName {
    return stateNames[(this.state + (stateNames.length - 1)) % stateNames.length];
  }
  // Transition to the next state
  incrementState(): void {
    this.state = (this.state + 1) % stateNames.length;
  }

  static includedKeys = makeSerializable("CorporationState", CorporationState);
}
