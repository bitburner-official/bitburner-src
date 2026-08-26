import type { Gang as IGang, EquipmentStats, GangOtherInfoObject } from "@nsdefs";
import type { Gang } from "../Gang/Gang";
import type { GangMember } from "../Gang/GangMember";
import type { GangMemberTask } from "../Gang/GangMemberTask";
import { type InternalAPI, type NetscriptContext, setRemovedFunctions } from "../Netscript/APIWrapper";

import { GangPromise, RecruitmentResult } from "../Gang/Gang";
import { Player } from "@player";
import { FactionName } from "@enums";
import { AllGangs } from "../Gang/AllGangs";
import { GangMemberTasks } from "../Gang/GangMemberTasks";
import { GangMemberUpgrades } from "../Gang/GangMemberUpgrades";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";
import { CONSTANTS } from "../Constants";
import { canCreateGang } from "../Gang/helpers";

export function NetscriptGang(): InternalAPI<IGang> {
  /** Functions as an API check and also returns the gang object */
  const getGang = function (ctx: NetscriptContext): Gang {
    if (!Player.gang) throw helpers.errorMessage(ctx, "必须已加入帮派", "API ACCESS");
    return Player.gang;
  };

  const getGangMember = function (ctx: NetscriptContext, name: string): GangMember {
    const gang = getGang(ctx);
    for (const member of gang.members) if (member.name === name) return member;
    throw helpers.errorMessage(ctx, `无效的帮派成员：'${name}'`);
  };

  const getGangTask = function (ctx: NetscriptContext, name: string): GangMemberTask {
    const task = GangMemberTasks[name];
    if (!task) {
      throw helpers.errorMessage(ctx, `无效的任务：'${name}'`);
    }

    return task;
  };

  const gangFunctions: InternalAPI<IGang> = {
    createGang: (ctx, _faction) => {
      const faction = getEnumHelper("FactionName").nsGetMember(ctx, _faction);
      const checkResult = canCreateGang(faction);
      if (!checkResult.success) {
        helpers.log(ctx, () => checkResult.message);
        return false;
      }

      const isHacking = faction === FactionName.NiteSec || faction === FactionName.TheBlackHand;
      Player.startGang(faction, isHacking);
      return true;
    },
    inGang: () => {
      return Player.gang ? true : false;
    },
    getMemberNames: (ctx) => {
      const gang = getGang(ctx);
      return gang.members.map((member) => member.name);
    },
    renameMember: (ctx, _memberName, _newName) => {
      const gang = getGang(ctx);
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const newName = helpers.string(ctx, "newName", _newName);
      const member = gang.members.find((m) => m.name === memberName);
      if (!memberName) {
        throw helpers.errorMessage(ctx, `无效的 memberName：""（空字符串）`);
      }
      if (!newName) {
        throw helpers.errorMessage(ctx, `无效的 newName：""（空字符串）`);
      }
      if (newName === memberName) {
        throw helpers.errorMessage(ctx, `newName 和 memberName 必须不同，但两者都是：${newName}`);
      }
      if (!member) {
        helpers.log(ctx, () => `重命名成员失败：不存在 memberName 为 ${memberName} 的成员`);
        return false;
      }
      if (gang.members.map((m) => m.name).includes(newName)) {
        helpers.log(ctx, () => `重命名成员失败：另一个成员已使用了 newName：${newName}`);
        return false;
      }
      member.name = newName;
      helpers.log(ctx, () => `已将成员从 memberName：${memberName} 重命名为 newName：${newName}`);
      return true;
    },
    getGangInformation: (ctx) => {
      const gang = getGang(ctx);
      return {
        faction: gang.facName,
        isHacking: gang.isHackingGang,
        moneyGainRate: gang.moneyGainRate,
        power: gang.getPower(),
        respect: gang.respect,
        respectGainRate: gang.respectGainRate,
        respectForNextRecruit: gang.respectForNextRecruit(),
        territory: gang.getTerritory(),
        territoryClashChance: gang.territoryClashChance,
        territoryWarfareEngaged: gang.territoryWarfareEngaged,
        wantedLevel: gang.wanted,
        wantedLevelGainRate: gang.wantedGainRate,
        wantedPenalty: gang.getWantedPenalty(),
        equipmentCostMult: 1 / gang.getDiscount(),
      };
    },
    getAllGangInformation: (ctx) => {
      getGang(ctx);
      const cpy: Record<string, GangOtherInfoObject> = {};
      for (const gang of Object.keys(AllGangs)) {
        cpy[gang] = Object.assign({}, AllGangs[gang]);
      }

      return cpy;
    },
    getMemberInformation: (ctx, _memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const gang = getGang(ctx);
      const member = getGangMember(ctx, memberName);
      return {
        name: member.name,
        task: member.task,
        earnedRespect: member.earnedRespect,
        hack: member.hack,
        str: member.str,
        def: member.def,
        dex: member.dex,
        agi: member.agi,
        cha: member.cha,

        hack_exp: member.hack_exp,
        str_exp: member.str_exp,
        def_exp: member.def_exp,
        dex_exp: member.dex_exp,
        agi_exp: member.agi_exp,
        cha_exp: member.cha_exp,

        hack_mult: member.hack_mult,
        str_mult: member.str_mult,
        def_mult: member.def_mult,
        dex_mult: member.dex_mult,
        agi_mult: member.agi_mult,
        cha_mult: member.cha_mult,

        hack_asc_mult: member.calculateAscensionMult(member.hack_asc_points),
        str_asc_mult: member.calculateAscensionMult(member.str_asc_points),
        def_asc_mult: member.calculateAscensionMult(member.def_asc_points),
        dex_asc_mult: member.calculateAscensionMult(member.dex_asc_points),
        agi_asc_mult: member.calculateAscensionMult(member.agi_asc_points),
        cha_asc_mult: member.calculateAscensionMult(member.cha_asc_points),

        hack_asc_points: member.hack_asc_points,
        str_asc_points: member.str_asc_points,
        def_asc_points: member.def_asc_points,
        dex_asc_points: member.dex_asc_points,
        agi_asc_points: member.agi_asc_points,
        cha_asc_points: member.cha_asc_points,

        upgrades: member.upgrades.slice(),
        augmentations: member.augmentations.slice(),

        respectGain: member.calculateRespectGain(gang),
        wantedLevelGain: member.calculateWantedLevelGain(gang),
        moneyGain: member.calculateMoneyGain(gang),
        expGain: member.calculateExpGain(),
      };
    },
    canRecruitMember: (ctx) => {
      const gang = getGang(ctx);
      return gang.canRecruitMember() === RecruitmentResult.Success;
    },
    getRecruitsAvailable: (ctx) => {
      const gang = getGang(ctx);
      return gang.getRecruitsAvailable();
    },
    respectForNextRecruit: (ctx) => {
      const gang = getGang(ctx);
      return gang.respectForNextRecruit();
    },
    recruitMember: (ctx, _memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const gang = getGang(ctx);
      const result = gang.recruitMember(memberName);
      if (result !== RecruitmentResult.Success) {
        ctx.workerScript.log("gang.recruitMember", () => `招募帮派成员 '${memberName}' 失败。${result}.`);
        return false;
      }
      ctx.workerScript.log("gang.recruitMember", () => `成功招募帮派成员 '${memberName}'`);
      return true;
    },
    getTaskNames: (ctx) => {
      const gang = getGang(ctx);
      const tasks = gang.getAllTaskNames();
      tasks.unshift("Unassigned");
      return tasks;
    },
    setMemberTask: (ctx, _memberName, _taskName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const taskName = helpers.string(ctx, "taskName", _taskName);
      const gang = getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!gang.getAllTaskNames().includes(taskName)) {
        ctx.workerScript.log(
          "gang.setMemberTask",
          () =>
            `将帮派成员 '${memberName}' 分配到无效任务 '${taskName}' 失败。'${memberName}' 现已变为未分配`,
        );
        return member.assignToTask("Unassigned");
      }
      const success = member.assignToTask(taskName);
      if (success) {
        ctx.workerScript.log(
          "gang.setMemberTask",
          () => `成功将帮派成员 '${memberName}' 分配到 '${taskName}' 任务`,
        );
      } else {
        ctx.workerScript.log(
          "gang.setMemberTask",
          () => `将帮派成员 '${memberName}' 分配到 '${taskName}' 任务失败。'${memberName}' 现已变为未分配`,
        );
      }

      return success;
    },
    getTaskStats: (ctx, _taskName) => {
      const taskName = helpers.string(ctx, "taskName", _taskName);
      getGang(ctx);
      const task = getGangTask(ctx, taskName);
      const copy = Object.assign({}, task);
      copy.territory = Object.assign({}, task.territory);
      return copy;
    },
    getEquipmentNames: (ctx) => {
      getGang(ctx);
      return Object.keys(GangMemberUpgrades);
    },
    getEquipmentCost: (ctx, _equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      const gang = getGang(ctx);
      const upg = GangMemberUpgrades[equipName];
      if (upg === null) return Infinity;
      return gang.getUpgradeCost(upg);
    },
    getEquipmentType: (ctx, _equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getGang(ctx);
      const upg = GangMemberUpgrades[equipName];
      if (upg == null) return "";
      return upg.getType();
    },
    getEquipmentStats: (ctx, _equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getGang(ctx);
      const equipment = GangMemberUpgrades[equipName];
      if (!equipment) {
        throw helpers.errorMessage(ctx, `无效的装备：${equipName}`);
      }
      const typecheck: EquipmentStats = equipment.mults;
      return Object.assign({}, typecheck);
    },
    purchaseEquipment: (ctx, _memberName, _equipName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getGang(ctx);
      const member = getGangMember(ctx, memberName);
      const equipment = GangMemberUpgrades[equipName];
      if (!equipment) {
        ctx.workerScript.log("gang.purchaseEquipment", () => `'${equipName}' 不是有效的装备`);
        return false;
      }
      const res = member.buyUpgrade(equipment);
      if (res) {
        ctx.workerScript.log(
          "gang.purchaseEquipment",
          () => `已为帮派成员 '${memberName}' 购买 '${equipName}'`,
        );
      } else {
        ctx.workerScript.log(
          "gang.purchaseEquipment",
          () => `为帮派成员 '${memberName}' 购买 '${equipName}' 失败`,
        );
      }

      return res;
    },
    ascendMember: (ctx, _memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const gang = getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!member.canAscend()) return;
      return gang.ascendMember(member, ctx.workerScript);
    },
    getAscensionResult: (ctx, _memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!member.canAscend()) return;
      return {
        respect: member.earnedRespect,
        ...member.getAscensionResults(),
      };
    },
    getInstallResult: (ctx, _memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!member.canAscend()) return;
      const preInstall = member.getCurrentAscensionMults();
      const postInstall = member.getPostInstallPoints();
      return {
        hack: member.calculateAscensionMult(postInstall.hack) / preInstall.hack,
        str: member.calculateAscensionMult(postInstall.str) / preInstall.str,
        def: member.calculateAscensionMult(postInstall.def) / preInstall.def,
        dex: member.calculateAscensionMult(postInstall.dex) / preInstall.dex,
        agi: member.calculateAscensionMult(postInstall.agi) / preInstall.agi,
        cha: member.calculateAscensionMult(postInstall.cha) / preInstall.cha,
      };
    },
    setTerritoryWarfare: (ctx, _engage) => {
      const engage = !!_engage;
      const gang = getGang(ctx);
      if (engage) {
        gang.territoryWarfareEngaged = true;
        ctx.workerScript.log("gang.setTerritoryWarfare", () => "开始帮派地盘争夺战");
      } else {
        gang.territoryWarfareEngaged = false;
        ctx.workerScript.log("gang.setTerritoryWarfare", () => "停止帮派地盘争夺战");
      }
    },
    getChanceToWinClash: (ctx, _otherGang) => {
      const otherGang = helpers.string(ctx, "otherGang", _otherGang);
      const gang = getGang(ctx);
      if (AllGangs[otherGang] == null) {
        throw helpers.errorMessage(ctx, `无效的帮派：${otherGang}`);
      }

      const playerPower = AllGangs[gang.facName].power;
      const otherPower = AllGangs[otherGang].power;

      return playerPower / (otherPower + playerPower);
    },
    getBonusTime: (ctx) => {
      const gang = getGang(ctx);
      return gang.storedCycles * CONSTANTS.MilliPerCycle;
    },
    nextUpdate: (ctx) => {
      getGang(ctx);
      if (!GangPromise.promise) GangPromise.promise = new Promise<number>((res) => (GangPromise.resolve = res));
      return GangPromise.promise;
    },
  };

  // Removed functions
  setRemovedFunctions(gangFunctions, {
    getOtherGangInformation: { version: "3.0.0", replacement: "gang.getAllGangInformation" },
  });
  return gangFunctions;
}
