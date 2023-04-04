import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";

interface IParams {
  name?: string;
  type?: number;
}

export class ActionIdentifier {
  name = "";
  type = -1;

  constructor(params: IParams = {}) {
    if (params.name) this.name = params.name;
    if (params.type) this.type = params.type;
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("ActionIdentifier", this);
  }

  static fromJSON(value: IReviverValue): ActionIdentifier {
    return Generic_fromJSON(ActionIdentifier, value.data);
  }
}

constructorsForReviver.ActionIdentifier = ActionIdentifier;
