import { CorpStateName } from "@nsdefs";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
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

  // Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("CorporationState", this);
  }
  // Initializes a CorporationState object from a JSON save state.
  static fromJSON(value: IReviverValue): CorporationState {
    return Generic_fromJSON(CorporationState, value.data);
  }
}

constructorsForReviver.CorporationState = CorporationState;
