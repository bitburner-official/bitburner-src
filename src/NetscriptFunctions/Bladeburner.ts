import type { Bladeburner as INetscriptBladeburner } from "@nsdefs";
import type { Action, LevelableAction } from "../Bladeburner/Types";
import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";

import { Player } from "@player";
import {
  BladeburnerActionType,
  BladeburnerContractName,
  BladeburnerGeneralActionName,
  BladeburnerOperationName,
  BladeburnerSkillName,
} from "@enums";
import { Bladeburner, BladeburnerPromise } from "../Bladeburner/Bladeburner";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { Skills } from "../Bladeburner/data/Skills";
import { assertStringWithNSContext } from "../Netscript/TypeAssertion";
import { numberOfBlackOperations } from "../Bladeburner/data/BlackOperations";
import { checkSleeveAPIAccess, checkSleeveNumber } from "../NetscriptFunctions/Sleeve";
import { canAccessBitNodeFeature } from "../BitNode/BitNodeUtils";
import {
  calculateActionRankGain,
  calculateActionRankLoss,
  calculateActionReputationGain,
} from "../Bladeburner/Formulas";
import { CONSTANTS } from "../Constants";

export function NetscriptBladeburner(): InternalAPI<INetscriptBladeburner> {
  const checkBladeburnerAccess = function (ctx: NetscriptContext): void {
    getBladeburner(ctx);
    return;
  };
  const getBladeburner = function (ctx: NetscriptContext): Bladeburner {
    const apiAccess = canAccessBitNodeFeature(7) || canAccessBitNodeFeature(6);
    if (!apiAccess) {
      throw helpers.errorMessage(ctx, "你尚未解锁 Bladeburner API。", "API ACCESS");
    }
    const bladeburner = Player.bladeburner;
    if (!bladeburner)
      throw helpers.errorMessage(ctx, "你必须成为 Bladeburner 部门的成员才能使用此 API。");
    return bladeburner;
  };
  function getAction(ctx: NetscriptContext, _type: unknown, name: unknown): Action {
    const bladeburner = Player.bladeburner;
    const type = getEnumHelper("BladeburnerActionType").nsGetMember(ctx, _type);
    assertStringWithNSContext(ctx, "name", name);
    if (bladeburner === null) {
      throw new Error("Must have joined bladeburner");
    }
    const action = bladeburner.getActionFromTypeAndName(type, name);
    if (!action) {
      throw helpers.errorMessage(ctx, `无效的动作 type='${_type}'，name='${name}'`);
    }
    return action;
  }

  function isLevelableAction(action: Action): action is LevelableAction {
    return action.type === BladeburnerActionType.Contract || action.type === BladeburnerActionType.Operation;
  }

  function getLevelableAction(ctx: NetscriptContext, type: unknown, name: unknown): LevelableAction {
    const action = getAction(ctx, type, name);
    if (!isLevelableAction(action)) {
      throw helpers.errorMessage(
        ctx,
        `类型为 ${action.type} 的动作无法升级等级，${ctx.functionPath} 需要一个可升级等级的动作`,
      );
    }
    return action;
  }

  return {
    inBladeburner: () => !!Player.bladeburner,
    getContractNames: (ctx) => {
      getBladeburner(ctx);
      return Object.values(BladeburnerContractName);
    },
    getOperationNames: (ctx) => {
      getBladeburner(ctx);
      return Object.values(BladeburnerOperationName);
    },
    getBlackOpNames: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      // Ensures they are sent in the correct order
      return bladeburner.blackOperationArray.map((blackOp) => blackOp.name);
    },
    getNextBlackOp: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      if (bladeburner.numBlackOpsComplete >= numberOfBlackOperations) return null;
      const blackOp = bladeburner.blackOperationArray[bladeburner.numBlackOpsComplete];
      return { name: blackOp.name, rank: blackOp.reqdRank };
    },
    getBlackOpRank: (ctx, _blackOpName) => {
      checkBladeburnerAccess(ctx);
      const blackOpName = getEnumHelper("BladeburnerBlackOpName").nsGetMember(ctx, _blackOpName);
      const bladeburner = getBladeburner(ctx);
      return bladeburner.blackOperations[blackOpName].reqdRank;
    },
    getGeneralActionNames: (ctx) => {
      getBladeburner(ctx);
      return Object.values(BladeburnerGeneralActionName);
    },
    getSkillNames: (ctx) => {
      getBladeburner(ctx);
      return Object.values(BladeburnerSkillName);
    },
    startAction: (ctx, type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      const attempt = bladeburner.startAction(action.id);
      helpers.log(ctx, () => attempt.message);
      return !!attempt.success;
    },
    stopBladeburnerAction: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      helpers.log(ctx, () => `正在停止当前的 Bladeburner 行动。`);
      return bladeburner.resetAction();
    },
    getCurrentAction: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      if (!bladeburner.action) return null;
      return { ...bladeburner.action };
    },
    getActionTime: (ctx, type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      // return ms instead of seconds
      return action.getActionTime(bladeburner, Player) * 1000;
    },
    getActionCurrentTime: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      return (
        Math.min(bladeburner.actionTimeCurrent + bladeburner.actionTimeOverflow, bladeburner.actionTimeToComplete) *
        1000
      );
    },
    getActionEstimatedSuccessChance: (ctx, type, name, _sleeve) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      if (_sleeve == null) {
        return action.getSuccessRange(bladeburner, Player);
      }
      checkSleeveAPIAccess(ctx);
      const sleeveNumber = helpers.number(ctx, "sleeve", _sleeve);
      checkSleeveNumber(ctx, sleeveNumber);
      switch (action.type) {
        case BladeburnerActionType.General:
        case BladeburnerActionType.Contract: {
          const sleevePerson = Player.sleeves[sleeveNumber];
          return action.getSuccessRange(bladeburner, sleevePerson);
        }
        default:
          return [0, 0];
      }
    },
    getActionRepGain: (ctx, type, name, _level) => {
      checkBladeburnerAccess(ctx);
      const action = getAction(ctx, type, name);
      const level = isLevelableAction(action) ? helpers.number(ctx, "level", _level ?? action.level) : 1;
      const rankGain = calculateActionRankGain(action, level);
      return calculateActionReputationGain(Player, rankGain);
    },
    getActionRankGain: (ctx, type, name, _level) => {
      checkBladeburnerAccess(ctx);
      const action = getAction(ctx, type, name);
      const level = isLevelableAction(action) ? helpers.number(ctx, "level", _level ?? action.level) : 1;
      return calculateActionRankGain(action, level);
    },
    getActionRankLoss: (ctx, type, name, _level) => {
      checkBladeburnerAccess(ctx);
      const action = getAction(ctx, type, name);
      const level = isLevelableAction(action) ? helpers.number(ctx, "level", _level ?? action.level) : 1;
      return calculateActionRankLoss(action, level);
    },
    getActionCountRemaining: (ctx, type, name) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      switch (action.type) {
        case BladeburnerActionType.General:
          return Infinity;
        case BladeburnerActionType.BlackOp:
          return bladeburner.numBlackOpsComplete > action.n ? 0 : 1;
        case BladeburnerActionType.Contract:
        case BladeburnerActionType.Operation:
          return action.count;
      }
    },
    getActionMaxLevel: (ctx, type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.maxLevel;
    },
    getActionCurrentLevel: (ctx, type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.level;
    },
    getActionAutolevel: (ctx, type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.autoLevel;
    },
    getActionSuccesses: (ctx, type, name) => {
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      return action.successes;
    },
    setActionAutolevel: (ctx, type, name, _autoLevel = true) => {
      const autoLevel = !!_autoLevel;
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      action.autoLevel = autoLevel;
      helpers.log(ctx, () => `${action.name} 的自动升级已${autoLevel ? "启用" : "禁用"}`);
    },
    setActionLevel: (ctx, type, name, _level) => {
      const level = helpers.positiveInteger(ctx, "level", _level ?? 1);
      checkBladeburnerAccess(ctx);
      const action = getLevelableAction(ctx, type, name);
      if (level < 1 || level > action.maxLevel) {
        throw helpers.errorMessage(ctx, `等级必须在 1 到 ${action.maxLevel} 之间，当前为 ${level}`);
      }
      action.level = level;
      helpers.log(ctx, () => `已将 ${action.name} 的等级设为 ${level}`);
    },
    getRank: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.rank;
    },
    getSkillPoints: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.skillPoints;
    },
    getSkillLevel: (ctx, _skillName) => {
      const bladeburner = getBladeburner(ctx);
      const skillName = getEnumHelper("BladeburnerSkillName").nsGetMember(ctx, _skillName, "skillName");
      return bladeburner.getSkillLevel(skillName);
    },
    getSkillUpgradeCost: (ctx, _skillName, _count) => {
      const bladeburner = getBladeburner(ctx);
      const skillName = getEnumHelper("BladeburnerSkillName").nsGetMember(ctx, _skillName, "skillName");
      const count = helpers.positiveInteger(ctx, "count", _count ?? 1);
      const currentLevel = bladeburner.getSkillLevel(skillName);
      const skill = Skills[skillName];
      if (currentLevel + count > skill.maxLvl) {
        return Infinity;
      }
      return skill.calculateCost(currentLevel, count);
    },
    upgradeSkill: (ctx, _skillName, _count) => {
      const bladeburner = getBladeburner(ctx);
      const skillName = getEnumHelper("BladeburnerSkillName").nsGetMember(ctx, _skillName, "skillName");
      const count = helpers.positiveInteger(ctx, "count", _count ?? 1);
      const attempt = bladeburner.upgradeSkill(skillName, count);
      helpers.log(ctx, () => attempt.message);
      return !!attempt.success;
    },
    getTeamSize: (ctx, type, name) => {
      const bladeburner = getBladeburner(ctx);
      if (!type && !name) return bladeburner.teamSize;
      const action = getAction(ctx, type, name);
      switch (action.type) {
        case BladeburnerActionType.General:
        case BladeburnerActionType.Contract:
          return 0;
        case BladeburnerActionType.BlackOp:
        case BladeburnerActionType.Operation:
          return action.teamCount;
      }
    },
    setTeamSize: (ctx, type, name, _size) => {
      const bladeburner = getBladeburner(ctx);
      const action = getAction(ctx, type, name);
      const size = helpers.integer(ctx, "size", _size);
      if (size < 0) {
        throw helpers.errorMessage(ctx, "size 必须是非负整数", "TYPE");
      }
      if (size > bladeburner.teamSize) {
        helpers.log(ctx, () => `团队成员不足，无法设置团队规模。`);
        return -1;
      }
      switch (action.type) {
        case BladeburnerActionType.Contract:
        case BladeburnerActionType.General:
          helpers.log(ctx, () => "仅对行动（Operation）和黑色行动有效");
          return -1;
        case BladeburnerActionType.BlackOp:
        case BladeburnerActionType.Operation: {
          action.teamCount = size;
          helpers.log(ctx, () => `已将 ${action.name} 的团队规模设为 ${size}`);
          return size;
        }
      }
    },
    getCityEstimatedPopulation: (ctx, _cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      return bladeburner.cities[cityName].popEst;
    },
    getCityCommunities: (ctx, _cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      return bladeburner.cities[cityName].comms;
    },
    getCityChaos: (ctx, _cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      return bladeburner.cities[cityName].chaos;
    },
    getCity: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.city;
    },
    switchCity: (ctx, _cityName) => {
      const bladeburner = getBladeburner(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);
      bladeburner.city = cityName;
      return true;
    },
    getStamina: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      return [bladeburner.stamina, bladeburner.maxStamina];
    },
    joinBladeburnerFaction: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      const attempt = bladeburner.joinFaction();
      helpers.log(ctx, () => attempt.message);
      return !!attempt.success;
    },
    joinBladeburnerDivision: (ctx) => {
      if (!canAccessBitNodeFeature(7) && !canAccessBitNodeFeature(6)) {
        helpers.log(ctx, () => "你没有源文件 6 或源文件 7。");
        return false;
      }
      if (Player.bitNodeOptions.disableBladeburner) {
        helpers.log(ctx, () => "Bladeburner 已被高级选项禁用。");
        return false;
      }
      if (currentNodeMults.BladeburnerRank === 0) {
        helpers.log(ctx, () => "Bladeburner 在此 BitNode 中被禁用。");
        return false;
      }
      // Already member
      if (Player.bladeburner) {
        return true;
      }
      if (
        Player.skills.strength < 100 ||
        Player.skills.defense < 100 ||
        Player.skills.dexterity < 100 ||
        Player.skills.agility < 100
      ) {
        helpers.log(
          ctx,
          () =>
            "你不满足加入 Bladeburner 部门的条件。所有战斗属性都必须至少达到 100 级。",
        );
        return false;
      }
      Player.startBladeburner();
      helpers.log(ctx, () => "你已被 Bladeburner 部门录取。");

      return true;
    },
    getBonusTime: (ctx) => {
      const bladeburner = getBladeburner(ctx);
      return bladeburner.storedCycles * CONSTANTS.MilliPerCycle;
    },
    nextUpdate: (ctx) => {
      checkBladeburnerAccess(ctx);
      if (!BladeburnerPromise.promise)
        BladeburnerPromise.promise = new Promise<number>((res) => (BladeburnerPromise.resolve = res));
      return BladeburnerPromise.promise;
    },
  };
}
