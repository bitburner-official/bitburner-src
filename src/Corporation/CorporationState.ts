import { CorpStateName } from "@nsdefs";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { stateNames } from "./data/Constants";
export class CorporationState {
  // Number representing what state the Corporation is in. The number
  // is an index for the array that holds all Corporation States
  state = 0;
  prevState = 0;

  // Get the name of the current state
  // NOTE: This does NOT return the number stored in the 'state' property,
  // which is just an index for the array of all possible Corporation States.
  getNextState(): CorpStateName {
    return stateNames[this.state];
  }
  getPrevState(): CorpStateName {
    return stateNames[this.prevState];
  }
  // Transition to the next state
  nextState(): void {
    this.prevState = this.state;
    this.state = (this.state + 1) % stateNames.length;
  }
  // Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("CorporationState", this);
  }

  // Initializes a CorporationState object from a JSON save state.
  static fromJSON(value: IReviverValue): CorporationState {
    const state = Generic_fromJSON(CorporationState, value.data);
    if (!state.prevState) state.prevState = 0;
    return state;
  }
}

constructorsForReviver.CorporationState = CorporationState;
