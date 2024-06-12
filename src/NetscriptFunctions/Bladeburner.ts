import type { Bladeburner as INetscriptBladeburner } from "@nsdefs";
import type { Action, LevelableAction } from "../Bladeburner/Types";
import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";

import { Player } from "@player";
import { BladeActionType, BladeContractName, BladeGeneralActionName, BladeOperationName, BladeSkillName } from "@enums";
import { Bladeburner, BladeburnerPromise } from "../Bladeburner/Bladeburner";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { Skills } from "../Bladeburner/data/Skills";
import { assertString } from "../Netscript/TypeAssertion";
import { BlackOperations, blackOpsArray } from "../Bladeburner/data/BlackOperations";

export function NetscriptBladeburner(): InternalAPI<INetscriptBladeburner> {
  const checkBladeburnerAccess = function (ctx: NetscriptContext): void {
    getBladeburner(ctx);
    return;
  };
  const getBladeburner = function (ctx: NetscriptContext): Bladeburner {
    const apiAccess = Player.bitNodeN === 7 || Player.sourceFileLvl(7) > 0;
    if (!apiAccess) {
      throw helpers.errorMessage(ctx, "You have not unlocked the Bladeburner API.", "API ACCESS");
    }
    const bladeburner = Player.bladeburner;
    if (!bladeburner)
      throw helpers.errorMessage(ctx, "You must be a member of the Bladeburner division to use this API.");
    return bladeburner;
  };

  function getAction(ctx: NetscriptContext, type: unknown, name: unknown): Action {
    const bladeburner = Player.bladeburner;
    assertString(ctx, "type", type);
    assertString(ctx, "name", name);
    if (bladeburner === null) throw new Error("Must have joined bladeburner");
    const action = bladeburner.getActionFromTypeAndName(type, name);
    if (!action) throw helpers.errorMessage(ctx, `Invalid action type='${type}', name='${name}'`);
    return action;
  }

  function isLevelableAction(action: Action): action is LevelableAction {
    return action.type === BladeActionType.contract || action.type === BladeActionType.operation;
  }

  function getLevelableAction(ctx: NetscriptContext, type: unknown, name: unknown): LevelableAction {
    const action = getAction(ctx, type, name);
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
      // Ensures they are sent in the correct order
      return blackOpsArray.map((blackOp) => blackOp.name);
    },
    getNextBlackOp: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      if (bladeburner.numBlackOpsComplete >= blackOpsArray.length) return null;
      const blackOp = blackOpsArray[bladeburner.numBlackOpsComplete];
      return { name: blackOp.name, rank: blackOp.reqdRank };
    },
    getBlackOpRank: (ctx) => (_blackOpName) => {
      checkBladeburnerAccess(ctx);
      const blackOpName = getEnumHelper("BladeBlackOpName").nsGetMember(ctx, _blackOpName);
      return BlackOperations[blackOpName].reqdRank;
    },
    getGeneralActionNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeGeneralActionName);
    },
    getSkillNames: (ctx) => () => {
      getBladeburner(ctx);
      return Object.values(BladeSkillName);
    },
    startAction: (ctx) => (type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      const attempt = bladeburner.startAction(action.id);
      helpers.log(ctx, () => attempt.message);
      return !!attempt.success;
    },
    stopBladeburnerAction: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      helpers.log(ctx, () => `Stopping current Bladeburner action.`);
      return bladeburner.resetAction();
    },
    getCurrentAction: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      if (!bladeburner.action) return null;
      return { ...bladeburner.action };
    },
    getActionTime: (ctx) => (type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      // return ms instead of seconds
      return action.getActionTime(bladeburner, Player) * 1000;
    },
    getActionCurrentTime: (ctx) => () => {
      const bladeburner = getBladeburner(ctx);
      return (
        Math.min(bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow, bladeburner.actionTimeToComplete) *
        1000
      );
    },
    getActionEstimatedSuccessChance: (ctx) => (type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      return action.getSuccessRange(bladeburner, Player);
    },
    getActionRepGain: (ctx) => (type, name, _level) => {
      checkBladeburnerAccess(ctx);
      const action = getAction(ctx, type, name);
      const level = isLevelableAction(action) ? helpers.number(ctx, "level", _level ?? action.level) : 1;
      const rewardMultiplier = isLevelableAction(action) ? Math.pow(action.rewardFac, level - 1) : 1;
      return action.rankGain * rewardMultiplier * currentNodeMults.BladeburnerRank;
    },
    getActionCountRemaining: (ctx) => (type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      switch (action.type) {
        case BladeActionType.general:
          return Infinity;
        case BladeActionType.blackOp:
          return bladeburner.numBlackOpsComplete > action.n ? 0 : 1;
        case BladeActionType.contract:
        case BladeActionType.operation:
          return action.count;
      }
    },
    getActionMaxLevel: (ctx) => (type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.maxLevel;
    },
    getActionCurrentLevel: (ctx) => (type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.level;
    },
    getActionAutolevel: (ctx) => (type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.autoLevel;
    },
    getActionSuccesses: (ctx) => (type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.successes;
    },
    setActionAutolevel:
      (ctx) =>
      (type, name, _autoLevel = true) => {
        const autoLevel = !!_autoLevel;
        checkBladeburnerAccess(ctx);
        const action = getLevelableAction(ctx, type, name);
        action.autoLevel = autoLevel;
        helpers.log(ctx, () => `Autolevel for ${action.name} has been ${autoLevel ? "enabled" : "disabled"}`);
      },
    setActionLevel: (ctx) => (type, name, _level) => {
      const level = helpers.positiveInteger(ctx, "level", _level ?? 1);
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      if (level < 1 || level > action.maxLevel) {
        throw helpers.errorMessage(ctx, `Level must be between 1 and ${action.maxLevel}, is ${level}`);
      }
      action.level = level;
      helpers.log(ctx, () => `Set level for ${action.name} to ${level}`);
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
    getSkillUpgradeCost: (ctx) => (_skillName, _count) => {
      const bladeburner = getBladeburner(ctx);
      const skillName = getEnumHelper("BladeSkillName").nsGetMember(ctx, _skillName, "skillName");
      const count = helpers.positiveInteger(ctx, "count", _count ?? 1);
      const currentLevel = bladeburner.getSkillLevel(skillName);
      return Skills[skillName].calculateCost(currentLevel, count);
    },
    upgradeSkill: (ctx) => (_skillName, _count) => {
      const bladeburner = getBladeburner(ctx);
      const skillName = getEnumHelper("BladeSkillName").nsGetMember(ctx, _skillName, "skillName");
      const count = helpers.positiveInteger(ctx, "count", _count ?? 1);
      const attempt = bladeburner.upgradeSkill(skillName, count);
      helpers.log(ctx, () => attempt.message);
      return !!attempt.success;
    },
    getTeamSize: (ctx) => (type, name) => {
      const bladeburner = getBladeburner(ctx);
      if (!type && !name) return bladeburner.teamSize;
      const action = getAction(ctx, type, name);
      switch (action.type) {
        case BladeActionType.general:
        case BladeActionType.contract:
          return 0;
        case BladeActionType.blackOp:
        case BladeActionType.operation:
          return action.teamCount;
      }
    },
    setTeamSize: (ctx) => (type, name, _size) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      const size = helpers.positiveInteger(ctx, "size", _size);
      if (size > bladeburner.teamSize) {
        helpers.log(ctx, () => `Failed to set team size due to not enough team members.`);
        return -1;
      }
      switch (action.type) {
        case BladeActionType.contract:
        case BladeActionType.general:
          helpers.log(ctx, () => "Only valid for Operations and Black Operations");
          return -1;
        case BladeActionType.blackOp:
        case BladeActionType.operation: {
          action.teamCount = size;
          helpers.log(ctx, () => `Set team size for ${action.name} to ${size}`);
          return size;
        }
      }
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
      const attempt = bladeburner.joinFaction();
      helpers.log(ctx, () => attempt.message);
      return !!attempt.success;
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
          Player.startBladeburner();
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
