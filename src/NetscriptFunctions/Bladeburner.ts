import type { Bladeburner as INetscriptBladeburner } from "@nsdefs";
import type { Action } from "../Bladeburner/Actions/Action";
import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";

import { Player } from "@player";
import {
  BladeActionType,
  BladeBlackOpName,
  BladeContractName,
  BladeGeneralActionName,
  BladeOperationName,
  BladeSkillName,
} from "@enums";
import { Bladeburner, BladeburnerPromise } from "../Bladeburner/Bladeburner";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { LevelableAction, isLevelableAction } from "../Bladeburner/Actions/LevelableAction";
import { Skills } from "../Bladeburner/data/Skills";

export function NetscriptBladeburner(): InternalAPI<INetscriptBladeburner> {
  const checkBladeburnerAccess = function (ctx: NetscriptContext): void {
    getBladeburner(ctx);
    return;
  };
  const getBladeburner = function (ctx: NetscriptContext): Bladeburner {
    const apiAccess = Player.bitNodeN === 7 || Player.sourceFileLvl(7) > 0;
    if (!apiAccess) {
      throw helpers.errorMessage(ctx, "You have not unlocked the bladeburner API.", "API ACCESS");
    }
    const bladeburner = Player.bladeburner;
    if (!bladeburner)
      throw helpers.errorMessage(ctx, "You must be a member of the Bladeburner division to use this API.");
    return bladeburner;
  };

  const getBladeburnerActionObject = function (ctx: NetscriptContext, type: string, name: string): Action {
    const bladeburner = Player.bladeburner;
    if (bladeburner === null) throw new Error("Must have joined bladeburner");
    const actionId = bladeburner.getActionIdFromTypeAndName(type, name);
    if (!actionId) throw helpers.errorMessage(ctx, `Invalid action type='${type}', name='${name}'`);
    const actionObj = bladeburner.getActionObject(actionId);
    return actionObj;
  };

  function getLevelableAction(ctx: NetscriptContext, type: string, name: string): LevelableAction {
    const action = getBladeburnerActionObject(ctx, type, name);
    if (!isLevelableAction(action)) {
      throw helpers.errorMessage(
        ctx,
        `Actions of type ${action.type} are not levelable, ${ctx.functionPath} requires a levelable action`,
      );
    }
    return action;
  }

  return {
    inBladeburner: () => () => !!Player.bladeburner,
    getContractNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeContractName);
    },
    getOperationNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeOperationName);
    },
    getBlackOpNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeBlackOpName);
    },
    getNextBlackOp: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.getNextBlackOp();
    },
    getBlackOpRank: (ctx) => (_blackOpName) => {
      const blackOpName = helpers.string(ctx, "blackOpName", _blackOpName);
      checkBladeburnerAccess(ctx);
      const action = getBladeburnerActionObject(ctx, "blackops", blackOpName);
      if (action.type !== BladeActionType.blackOp) throw new Error("action was not a black operation");
      return action.reqdRank;
    },
    getGeneralActionNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeGeneralActionName);
    },
    getSkillNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeSkillName);
    },
    startAction: (ctx) => (_type, _name) => {
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      const bladeburner = getBladeburner(ctx);
      try {
        return bladeburner.startActionNetscriptFn(type, name, ctx.workerScript);
      } catch (e: unknown) {
        throw helpers.errorMessage(ctx, String(e));
      }
    },
    stopBladeburnerAction: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.resetAction();
    },
    getCurrentAction: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      // Temporary bad return type to not be an API break (idle should just return null)
      if (!bladeburner.action) return { type: "Idle", name: "Idle" };
      return { ...bladeburner.action };
    },
    getActionTime: (ctx) => (_type, _name) => {
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      const bladeburner = getBladeburner(ctx);
      try {
        const time = bladeburner.getActionTimeNetscriptFn(Player, type, name);
        if (typeof time === "string") {
          const errorLogText = `Invalid action: type='${type}' name='${name}'`;
          helpers.log(ctx, () => errorLogText);
          return -1;
        } else {
          return time;
        }
      } catch (e: unknown) {
        throw helpers.errorMessage(ctx, String(e));
      }
    },
    getActionCurrentTime: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      try {
        const timecomputed =
          Math.min(bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow, bladeburner.actionTimeToComplete) *
          1000;
        return timecomputed;
      } catch (e: unknown) {
        throw helpers.errorMessage(ctx, String(e));
      }
    },
    getActionEstimatedSuccessChance: (ctx) => (_type, _name) => {
      const bladeburner = getBladeburner(ctx);
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      try {
        const chance = bladeburner.getActionEstimatedSuccessChanceNetscriptFn(Player, type, name);
        if (typeof chance === "string") {
          const errorLogText = `Invalid action: type='${type}' name='${name}'`;
          helpers.log(ctx, () => errorLogText);
          return [-1, -1];
        } else {
          return chance;
        }
      } catch (e: unknown) {
        throw helpers.errorMessage(ctx, String(e));
      }
    },
    getActionRepGain: (ctx) => (_type, _name, _level) => {
      checkBladeburnerAccess(ctx);
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      const action = getBladeburnerActionObject(ctx, type, name);
      const level = isLevelableAction(action) ? helpers.number(ctx, "level", _level ?? action.level) : 1;
      const rewardMultiplier = Math.pow(action.rewardFac, level - 1);
      return action.rankGain * rewardMultiplier * currentNodeMults.BladeburnerRank;
    },
    getActionCountRemaining: (ctx) => (_type, _name) => {
      const bladeburner = getBladeburner(ctx);
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      try {
        return bladeburner.getActionCountRemainingNetscriptFn(type, name, ctx.workerScript);
      } catch (e: unknown) {
        throw helpers.errorMessage(ctx, String(e));
      }
    },
    getActionMaxLevel: (ctx) => (_type, _name) => {
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.maxLevel;
    },
    getActionCurrentLevel: (ctx) => (_type, _name) => {
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.level;
    },
    getActionAutolevel: (ctx) => (_type, _name) => {
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.autoLevel;
    },
    getActionSuccesses: (ctx) => (_type, _name) => {
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.successes;
    },
    setActionAutolevel:
      (ctx) =>
      (_type, _name, _autoLevel = true) => {
        const type = helpers.string(ctx, "type", _type);
        const name = helpers.string(ctx, "name", _name);
        const autoLevel = !!_autoLevel;
        checkBladeburnerAccess(ctx);
        const action = getLevelableAction(ctx, type, name);
        action.autoLevel = autoLevel;
      },
    setActionLevel:
      (ctx) =>
      (_type, _name, _level = 1) => {
        const type = helpers.string(ctx, "type", _type);
        const name = helpers.string(ctx, "name", _name);
        const level = helpers.number(ctx, "level", _level);
        checkBladeburnerAccess(ctx);
        const action = getLevelableAction(ctx, type, name);
        if (level < 1 || level > action.maxLevel) {
          throw helpers.errorMessage(ctx, `Level must be between 1 and ${action.maxLevel}, is ${level}`);
        }
        action.level = level;
      },
    getRank: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.rank;
    },
    getSkillPoints: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.skillPoints;
    },
    getSkillLevel: (ctx) => (_skillName) => {
      const bladeburner = getBladeburner(ctx);
      const skillName = getEnumHelper("BladeSkillName").nsGetMember(ctx, _skillName, "skillName");
      return bladeburner.getSkillLevel(skillName);
    },
    getSkillUpgradeCost:
      (ctx) =>
      (_skillName, _count = 1) => {
        const bladeburner = getBladeburner(ctx);
        const skillName = getEnumHelper("BladeSkillName").nsGetMember(ctx, _skillName, "skillName");
        const count = helpers.positiveInteger(ctx, "count", _count);
        const currentLevel = bladeburner.getSkillLevel(skillName);
        return Skills[skillName].calculateCost(currentLevel, count);
      },
    upgradeSkill:
      (ctx) =>
      (_skillName, _count = 1) => {
        const bladeburner = getBladeburner(ctx);
        const skillName = getEnumHelper("BladeSkillName").nsGetMember(ctx, _skillName, "skillName");
        const count = helpers.positiveInteger(ctx, "count", _count);
        return bladeburner.upgradeSkillNetscriptFn(ctx, skillName, count);
      },
    getTeamSize: (ctx) => (_type, _name) => {
      const bladeburner = getBladeburner(ctx);
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      return bladeburner.getTeamSizeNetscriptFn(type, name, ctx.workerScript);
    },
    setTeamSize: (ctx) => (_type, _name, _size) => {
      const bladeburner = getBladeburner(ctx);
      const type = helpers.string(ctx, "type", _type);
      const name = helpers.string(ctx, "name", _name);
      const size = helpers.number(ctx, "size", _size);
      return bladeburner.setTeamSizeNetscriptFn(type, name, size, ctx.workerScript);
    },
    getCityEstimatedPopulation: (ctx) => (_cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      return bladeburner.cities[cityName].popEst;
    },
    getCityCommunities: (ctx) => (_cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      return bladeburner.cities[cityName].comms;
    },
    getCityChaos: (ctx) => (_cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      return bladeburner.cities[cityName].chaos;
    },
    getCity: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.city;
    },
    switchCity: (ctx) => (_cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      bladeburner.city = cityName;
      return true;
    },
    getStamina: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return [bladeburner.stamina, bladeburner.maxStamina];
    },
    joinBladeburnerFaction: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.joinBladeburnerFactionNetscriptFn(ctx.workerScript);
    },
    joinBladeburnerDivision: (ctx) => () => {
      if (Player.bitNodeN === 7 || Player.sourceFileLvl(7) > 0) {
        if (currentNodeMults.BladeburnerRank === 0) {
          return false; // Disabled in this bitnode
        }
        if (Player.bladeburner) {
          return true; // Already member
        } else if (
          Player.skills.strength >= 100 &&
          Player.skills.defense >= 100 &&
          Player.skills.dexterity >= 100 &&
          Player.skills.agility >= 100
        ) {
          Player.bladeburner = new Bladeburner();
          helpers.log(ctx, () => "You have been accepted into the Bladeburner division");

          return true;
        } else {
          helpers.log(ctx, () => "You do not meet the requirements for joining the Bladeburner division");
          return false;
        }
      }
      return false;
    },
    getBonusTime: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return Math.round(bladeburner.storedCycles / 5) * 1000;
    },
    nextUpdate: (ctx) => () => {
      checkBladeburnerAccess(ctx);
      if (!BladeburnerPromise.promise)
        BladeburnerPromise.promise = new Promise<number>((res) => (BladeburnerPromise.resolve = res));
      return BladeburnerPromise.promise;
    },
  };
}
