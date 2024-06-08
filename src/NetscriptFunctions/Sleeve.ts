import type { Augmentation } from "../Augmentation/Augmentation";
import type { Sleeve as NetscriptSleeve } from "@nsdefs";
import type { ActionIdentifier } from "../Bladeburner/Types";

import { Player } from "@player";
import { BladeActionType, type BladeContractName } from "@enums";
import { Augmentations } from "../Augmentation/Augmentations";
import { findCrime } from "../Crime/CrimeHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { InternalAPI, NetscriptContext, setRemovedFunctions } from "../Netscript/APIWrapper";
import { SleeveBladeburnerWork } from "../PersonObjects/Sleeve/Work/SleeveBladeburnerWork";
import { isSleeveFactionWork } from "../PersonObjects/Sleeve/Work/SleeveFactionWork";
import { isSleeveCompanyWork } from "../PersonObjects/Sleeve/Work/SleeveCompanyWork";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getAugCost } from "../Augmentation/AugmentationHelpers";
import { Factions } from "../Faction/Factions";
import { SleeveWorkType } from "../PersonObjects/Sleeve/Work/Work";

export function NetscriptSleeve(): InternalAPI<NetscriptSleeve> {
  const checkSleeveAPIAccess = function (ctx: NetscriptContext) {
    if (Player.bitNodeN !== 10 && !Player.sourceFileLvl(10)) {
      throw helpers.errorMessage(
        ctx,
        "You do not currently have access to the Sleeve API. This is either because you are not in BitNode-10 or because you do not have Source-File 10",
      );
    }
  };

  const checkSleeveNumber = function (ctx: NetscriptContext, sleeveNumber: number) {
    if (sleeveNumber >= Player.sleeves.length || sleeveNumber < 0) {
      const msg = `Invalid sleeve number: ${sleeveNumber}`;
      helpers.log(ctx, () => msg);
      throw helpers.errorMessage(ctx, msg);
    }
  };

  const sleeveFunctions: InternalAPI<NetscriptSleeve> = {
    getNumSleeves: (ctx) => () => {
      checkSleeveAPIAccess(ctx);
      return Player.sleeves.length;
    },
    setToIdle: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      Player.sleeves[sleeveNumber].stopWork();
    },
    setToShockRecovery: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].shockRecovery();
    },
    setToSynchronize: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].synchronize();
    },
    setToCommitCrime: (ctx) => (_sleeveNumber, _crimeType) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const crimeType = helpers.string(ctx, "crimeType", _crimeType);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      const crime = findCrime(crimeType);
      if (crime == null) return false;
      return Player.sleeves[sleeveNumber].commitCrime(crime.type);
    },
    setToUniversityCourse: (ctx) => (_sleeveNumber, _universityName, _className) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const universityName = helpers.string(ctx, "universityName", _universityName);
      const className = helpers.string(ctx, "className", _className);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      return Player.sleeves[sleeveNumber].takeUniversityCourse(universityName, className);
    },
    travel: (ctx) => (_sleeveNumber, _cityName) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      if (!Player.sleeves[sleeveNumber].travel(cityName)) {
        helpers.log(ctx, () => "Not enough money to travel.");
        return false;
      }
      return true;
    },
    setToCompanyWork: (ctx) => (_sleeveNumber, _companyName) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
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
            `Sleeve ${sleeveNumber} cannot work for company ${companyName} because Sleeve ${i} is already working for them.`,
          );
        }
      }

      return Player.sleeves[sleeveNumber].workForCompany(companyName);
    },
    setToFactionWork: (ctx) => (_sleeveNumber, _factionName, _workType) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const factionName = getEnumHelper("FactionName").nsGetMember(ctx, _factionName);
      const workType = helpers.string(ctx, "workType", _workType);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      if (!Factions[factionName].isMember) {
        throw helpers.errorMessage(ctx, `Cannot work for faction ${factionName} without being a member.`);
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
            `Sleeve ${sleeveNumber} cannot work for faction ${factionName} because Sleeve ${i} is already working for them.`,
          );
        }
      }

      if (Player.gang && Player.gang.facName == factionName) {
        throw helpers.errorMessage(
          ctx,
          `Sleeve ${sleeveNumber} cannot work for faction ${factionName} because you have started a gang with them.`,
        );
      }

      return Player.sleeves[sleeveNumber].workForFaction(factionName, workType);
    },
    setToGymWorkout: (ctx) => (_sleeveNumber, _gymName, _stat) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const gymName = helpers.string(ctx, "gymName", _gymName);
      const stat = helpers.string(ctx, "stat", _stat);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      return Player.sleeves[sleeveNumber].workoutAtGym(gymName, stat);
    },
    getTask: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const sl = Player.sleeves[sleeveNumber];
      if (sl.currentWork === null) return null;
      return sl.currentWork.APICopy(sl);
    },
    getSleeve: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
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
    getSleeveAugmentations: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      const augs = [];
      for (let i = 0; i < Player.sleeves[sleeveNumber].augmentations.length; i++) {
        augs.push(Player.sleeves[sleeveNumber].augmentations[i].name);
      }
      return augs;
    },
    getSleevePurchasableAugs: (ctx) => (_sleeveNumber) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
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
    purchaseSleeveAug: (ctx) => (_sleeveNumber, _augName) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);

      if (Player.sleeves[sleeveNumber].shock > 0) {
        throw helpers.errorMessage(ctx, `Sleeve shock too high: Sleeve ${sleeveNumber}`);
      }

      const aug = Augmentations[augName];
      if (!aug) {
        throw helpers.errorMessage(ctx, `Invalid aug: ${augName}`);
      }

      return Player.sleeves[sleeveNumber].tryBuyAugmentation(aug);
    },
    getSleeveAugmentationPrice: (ctx) => (_augName) => {
      checkSleeveAPIAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug: Augmentation = Augmentations[augName];
      return aug.baseCost;
    },
    getSleeveAugmentationRepReq: (ctx) => (_augName) => {
      checkSleeveAPIAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug: Augmentation = Augmentations[augName];
      return getAugCost(aug).repCost;
    },
    setToBladeburnerAction: (ctx) => (_sleeveNumber, _action, _contract?) => {
      const sleeveNumber = helpers.number(ctx, "sleeveNumber", _sleeveNumber);
      const action = helpers.string(ctx, "action", _action);
      checkSleeveAPIAccess(ctx);
      checkSleeveNumber(ctx, sleeveNumber);
      let contract: BladeContractName | undefined = undefined;
      if (action === "Take on contracts") {
        contract = getEnumHelper("BladeContractName").nsGetMember(ctx, _contract);
        for (let i = 0; i < Player.sleeves.length; ++i) {
          if (i === sleeveNumber) continue;
          const otherWork = Player.sleeves[i].currentWork;
          if (otherWork?.type === SleeveWorkType.BLADEBURNER && otherWork.actionId.name === contract) {
            throw helpers.errorMessage(
              ctx,
              `Sleeve ${sleeveNumber} cannot take on contracts because Sleeve ${i} is already performing that action.`,
            );
          }
        }
        const actionId: ActionIdentifier = { type: BladeActionType.contract, name: contract };
        Player.sleeves[sleeveNumber].startWork(new SleeveBladeburnerWork({ actionId }));
      }
      return Player.sleeves[sleeveNumber].bladeburner(action, contract);
    },
  };

  // Removed functions
  setRemovedFunctions(sleeveFunctions, {
    getSleeveStats: { version: "2.2.0", replacement: "sleeve.getSleeve" },
    getInformation: { version: "2.2.0", replacement: "sleeve.getSleeve" },
  });
  return sleeveFunctions;
}
