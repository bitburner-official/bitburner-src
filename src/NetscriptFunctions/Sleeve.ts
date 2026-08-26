import type { Augmentation } from "../Augmentation/Augmentation";
import type { Sleeve as NetscriptSleeve } from "@nsdefs";
import type { ActionIdentifier } from "../Bladeburner/Types";

import { Player } from "@player";
import { BladeburnerActionType, SpecialBladeburnerActionTypeForSleeve, type BladeburnerContractName } from "@enums";
import { Augmentations } from "../Augmentation/Augmentations";
import { getEnumHelper } from "../utils/EnumHelper";
import { InternalAPI, NetscriptContext, setRemovedFunctions } from "../Netscript/APIWrapper";
import { isSleeveFactionWork } from "../PersonObjects/Sleeve/Work/SleeveFactionWork";
import { isSleeveCompanyWork } from "../PersonObjects/Sleeve/Work/SleeveCompanyWork";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getAugCost } from "../Augmentation/AugmentationHelpers";
import { Factions } from "../Faction/Factions";
import { SleeveWorkType } from "../PersonObjects/Sleeve/Work/Work";
import { canAccessBitNodeFeature } from "../BitNode/BitNodeUtils";
import { Crimes } from "../Crime/Crimes";
import {
  getSleeveCost,
  purchaseSleeve,
  purchaseSleeveMemoryUpgrade,
} from "../PersonObjects/Sleeve/SleeveCovenantPurchases";

export const checkBitNodeRequirement = function (ctx: NetscriptContext) {
  if (Player.bitNodeN !== 10) {
    throw helpers.errorMessage(ctx, "你必须处于 BitNode 10 才能使用此 API。");
  }
};

export const checkSleeveAPIAccess = function (ctx: NetscriptContext) {
  /**
   * Don't change sourceFileLvl to activeSourceFileLvl. The ability to control Sleeves (via both UI and APIs) is a
   * permanent benefit.
   */
  if (Player.bitNodeN !== 10 && Player.sourceFileLvl(10) <= 0) {
    throw helpers.errorMessage(
      ctx,
      "你目前无法访问分身 API。这可能是因为你不在 BitNode-10，或者你没有源文件 10",
    );
  }
};

export const checkSleeveNumber = function (ctx: NetscriptContext, sleeveNumber: number) {
  if (sleeveNumber >= Player.sleeves.length || sleeveNumber < 0) {
    const msg = `无效的分身编号：${sleeveNumber}`;
    throw helpers.errorMessage(ctx, msg);
  }
};

export function NetscriptSleeve(): InternalAPI<NetscriptSleeve> {
  const checkSleeveAPIAccess = function (ctx: NetscriptContext) {
    if (!canAccessBitNodeFeature(10)) {
      throw helpers.errorMessage(
        ctx,
        "你无法访问分身 API。这可能是因为你不在 BitNode-10，或者你没有源文件 10。",
      );
    }
  };

  const checkSleeveNumber = function (ctx: NetscriptContext, sleeveNumber: number) {
    if (sleeveNumber >= Player.sleeves.length || sleeveNumber < 0) {
      const msg = `无效的分身编号：${sleeveNumber}`;
      helpers.log(ctx, () => msg);
      throw helpers.errorMessage(ctx, msg);
    }
  };

  const sleeveFunctions: InternalAPI<NetscriptSleeve> = {
    getNumSleeves: (ctx) => {
      checkSleeveAPIAccess(ctx);
      return Player.sleeves.length;
    },
    setToIdle: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      Player.sleeves[sleeveNumber].stopWork();
    },
    setToShockRecovery: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].shockRecovery();
    },
    setToSynchronize: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].synchronize();
    },
    setToCommitCrime: (ctx, _sleeveNumber, _crimeType) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const crimeType = getEnumHelper("CrimeType").nsGetMember(ctx, _crimeType);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      const crime = Crimes[crimeType];
      if (crime == null) return false;
      return Player.sleeves[sleeveNumber].commitCrime(crime.type);
    },
    setToUniversityCourse: (ctx, _sleeveNumber, _universityName, _className) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const universityName = helpers.string(ctx, "universityName", _universityName);
      const className = getEnumHelper("UniversityClassType").nsGetMember(ctx, _className);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].takeUniversityCourse(universityName, className);
    },
    travel: (ctx, _sleeveNumber, _cityName) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      if (!Player.sleeves[sleeveNumber].travel(cityName)) {
        helpers.log(ctx, () => "资金不足，无法旅行。");
        return false;
      }
      return true;
    },
    setToCompanyWork: (ctx, _sleeveNumber, _companyName) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      // Cannot work at the same company that another sleeve is working at
      for (let i = 0; i < Player.sleeves.length; ++i) {
        if (i === sleeveNumber) {
          continue;
        }
        const other = Player.sleeves[i];
        if (isSleeveCompanyWork(other.currentWork) && other.currentWork.companyName === companyName) {
          throw helpers.errorMessage(
            ctx,
            `分身 ${sleeveNumber} 不能为公司 ${companyName} 工作，因为分身 ${i} 已经在为它工作了。`,
          );
        }
      }

      return Player.sleeves[sleeveNumber].workForCompany(companyName);
    },
    setToFactionWork: (ctx, _sleeveNumber, _factionName, _workType) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const factionName = getEnumHelper("FactionName").nsGetMember(ctx, _factionName);
      const workType = getEnumHelper("FactionWorkType").nsGetMember(ctx, _workType);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      if (!Factions[factionName].isMember) {
        throw helpers.errorMessage(ctx, `不是派系 ${factionName} 的成员，无法为其工作。`);
      }

      // Cannot work at the same faction that another sleeve is working at
      for (let i = 0; i < Player.sleeves.length; ++i) {
        if (i === sleeveNumber) {
          continue;
        }
        const other = Player.sleeves[i];
        if (isSleeveFactionWork(other.currentWork) && other.currentWork.factionName === factionName) {
          throw helpers.errorMessage(
            ctx,
            `分身 ${sleeveNumber} 不能为派系 ${factionName} 工作，因为分身 ${i} 已经在为它工作了。`,
          );
        }
      }

      if (Player.gang && Player.gang.facName == factionName) {
        throw helpers.errorMessage(
          ctx,
          `分身 ${sleeveNumber} 不能为派系 ${factionName} 工作，因为你已与它建立了帮派。`,
        );
      }

      return Player.sleeves[sleeveNumber].workForFaction(factionName, workType);
    },
    setToGymWorkout: (ctx, _sleeveNumber, _gymName, _stat) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const gymName = helpers.string(ctx, "gymName", _gymName);
      const stat = getEnumHelper("GymType").nsGetMember(ctx, _stat);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      return Player.sleeves[sleeveNumber].workoutAtGym(gymName, stat);
    },
    getTask: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const sl = Player.sleeves[sleeveNumber];
      if (sl.currentWork === null) return null;
      return sl.currentWork.APICopy(sl);
    },
    getSleeve: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const sl = Player.sleeves[sleeveNumber];

      const data = {
        hp: structuredClone(sl.hp),
        skills: structuredClone(sl.skills),
        exp: structuredClone(sl.exp),
        mults: structuredClone(sl.mults),
        city: sl.city,
        shock: sl.shock,
        sync: sl.sync,
        memory: sl.memory,
        storedCycles: sl.storedCycles,
      };

      return data;
    },
    getSleeveAugmentations: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const augs = [];
      for (let i = 0; i < Player.sleeves[sleeveNumber].augmentations.length; i++) {
        augs.push(Player.sleeves[sleeveNumber].augmentations[i].name);
      }
      return augs;
    },
    getSleevePurchasableAugs: (ctx, _sleeveNumber) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const purchasableAugs = Player.sleeves[sleeveNumber].findPurchasableAugs();
      const augs = [];
      for (let i = 0; i < purchasableAugs.length; i++) {
        const aug = purchasableAugs[i];
        augs.push({
          name: aug.name,
          cost: aug.baseCost,
        });
      }

      return augs;
    },
    purchaseSleeveAug: (ctx, _sleeveNumber, _augName) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const aug = Augmentations[augName];
      if (!aug) {
        throw helpers.errorMessage(ctx, `无效的强化：${augName}`);
      }

      const result = Player.sleeves[sleeveNumber].purchaseAugmentation(aug);
      if (!result.success) {
        helpers.log(ctx, () => result.message);
      }
      return result.success;
    },
    getSleeveAugmentationPrice: (ctx, _augName) => {
      checkSleeveAPIAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug: Augmentation = Augmentations[augName];
      return aug.baseCost;
    },
    getSleeveAugmentationRepReq: (ctx, _augName) => {
      checkSleeveAPIAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug: Augmentation = Augmentations[augName];
      return getAugCost(aug).repCost;
    },
    setToBladeburnerAction: (ctx, _sleeveNumber, _action, _contract?) => {
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      const action = helpers.string(ctx, "action", _action);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      if (!Player.bladeburner) {
        helpers.log(ctx, () => "你必须成为 Bladeburner 部门的成员才能使用此 API。");
        return false;
      }
      let contract: BladeburnerContractName | undefined = undefined;
      if (action === SpecialBladeburnerActionTypeForSleeve.TakeOnContracts) {
        contract = getEnumHelper("BladeburnerContractName").nsGetMember(ctx, _contract);
        for (let i = 0; i < Player.sleeves.length; ++i) {
          if (i === sleeveNumber) {
            continue;
          }
          const otherWork = Player.sleeves[i].currentWork;
          if (otherWork?.type === SleeveWorkType.BLADEBURNER && otherWork.actionId.name === contract) {
            throw helpers.errorMessage(
              ctx,
              `分身 ${sleeveNumber} 无法承接合约，因为分身 ${i} 已经在执行该行动了。`,
            );
          }
        }
        const actionId: ActionIdentifier = { type: BladeburnerActionType.Contract, name: contract };
        const availability = Player.bladeburner.getActionObject(actionId).getAvailability(Player.bladeburner);
        if (!availability.available) {
          helpers.log(ctx, () => `无法开始行动 ${contract}：${availability.error}`);
          return false;
        }
      }
      return Player.sleeves[sleeveNumber].bladeburner(action, contract);
    },
    purchaseSleeve: (ctx) => {
      checkBitNodeRequirement(ctx);
      const result = purchaseSleeve();
      if (!result.success) {
        helpers.log(ctx, () => result.message);
      }
      return result;
    },
    upgradeMemory: (ctx, _sleeveNumber, _amount) => {
      checkBitNodeRequirement(ctx);
      const amount = helpers.positiveInteger(ctx, "amount", _amount);
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveNumber(ctx, sleeveNumber);
      const result = purchaseSleeveMemoryUpgrade(Player.sleeves[sleeveNumber], amount);
      if (!result.success) {
        helpers.log(ctx, () => result.message);
      }
      return result;
    },
    getSleeveCost: (ctx) => {
      checkSleeveAPIAccess(ctx);
      return getSleeveCost(Player.sleevesFromCovenant);
    },
    getMemoryUpgradeCost: (ctx, _sleeveNumber, _amount) => {
      checkSleeveAPIAccess(ctx);
      const amount = helpers.positiveInteger(ctx, "amount", _amount);
      const sleeveNumber = helpers.integer(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].getMemoryUpgradeCost(amount);
    },
  };

  // Removed functions
  setRemovedFunctions(sleeveFunctions, {
    getSleeveStats: { version: "2.2.0", replacement: "sleeve.getSleeve" },
    getInformation: { version: "2.2.0", replacement: "sleeve.getSleeve" },
  });
  return sleeveFunctions;
}
