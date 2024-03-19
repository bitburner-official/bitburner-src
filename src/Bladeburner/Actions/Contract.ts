import type { Bladeburner } from "../Bladeburner";
import type { ActionIdentifier } from "../Types";

import { IReviverValue, assertLoadingType, constructorsForReviver } from "../../utils/JSONReviver";
import { BladeActionType, BladeContractName } from "../Enums";
import { LevelableActionClass, LevelableActionParams, LevelableActionSaveData } from "./LevelableAction";
import { getEnumHelper } from "../../utils/EnumHelper";
import { Contracts, initContracts } from "../data/Contracts";

export class Contract extends LevelableActionClass {
  type: BladeActionType.contract = BladeActionType.contract;
  count = 0;
  name: BladeContractName = BladeContractName.tracking;
  get id(): ActionIdentifier {
    return { type: this.type, name: this.name };
  }

  constructor(params: (LevelableActionParams & { name: BladeContractName }) | null = null) {
    super(params);
    if (params) this.name = params.name;
  }

  getActionTypeSkillSuccessBonus(inst: Bladeburner): number {
    return inst.skillMultipliers.successChanceContract;
  }

  toJSON(): IReviverValue {
    return this.save("Contract", "name");
  }

  static fromJSON(value: IReviverValue): Contract {
    const contracts = Contracts || initContracts();
    // Don't load invalid contracts
    const name = getEnumHelper("BladeContractName").getMember(value.data?.name);
    if (!name) return undefined as unknown as Contract;
    if (!value.data || typeof value.data !== "object") return contracts[name];
    assertLoadingType<LevelableActionSaveData>(value.data);
    // Use generic LevelableAction loader first
    const loadedContract = LevelableActionClass.load(contracts[name], value.data);
    return loadedContract;
  }
}

constructorsForReviver.Contract = Contract;
