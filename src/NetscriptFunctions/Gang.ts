import type { Gang as IGang, EquipmentStats, GangOtherInfoObject } from "@nsdefs";
import type { Gang } from "../Gang/Gang";
import type { GangMember } from "../Gang/GangMember";
import type { GangMemberTask } from "../Gang/GangMemberTask";
import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";

import { GangPromise } from "../Gang/Gang";
import { Player } from "@player";
import { GangMemberType } from "@enums";
import { GangConstants } from "../Gang/data/Constants";
import { AllGangs } from "../Gang/AllGangs";
import { GangMemberTasks } from "../Gang/GangMemberTasks";
import { GangMemberUpgrades } from "../Gang/GangMemberUpgrades";
import { helpers } from "../Netscript/NetscriptHelpers";
import { getEnumHelper } from "../utils/EnumHelper";

export function NetscriptGang(): InternalAPI<IGang> {
  /** Functions as an API check and also returns the gang object */
  const getGang = function (ctx: NetscriptContext): Gang {
    if (!Player.gang) throw helpers.errorMessage(ctx, "Must have joined gang", "API ACCESS");
    return Player.gang;
  };

  const getGangMember = function (ctx: NetscriptContext, name: string): GangMember {
    const gang = getGang(ctx);
    for (const member of gang.members) if (member.name === name) return member;
    throw helpers.errorMessage(ctx, `Invalid gang member: '${name}'`);
  };

  const getGangTask = function (ctx: NetscriptContext, name: string): GangMemberTask {
    const task = GangMemberTasks[name];
    if (!task) {
      throw helpers.errorMessage(ctx, `Invalid task: '${name}'`);
    }

    return task;
  };

  return {
    createGang: (ctx) => (_faction) => {
      const faction = getEnumHelper("FactionName").nsGetMember(ctx, _faction);
      if (!Player.canAccessGang() || !GangConstants.Names.includes(faction)) return false;
      if (Player.gang) return false;
      if (!Player.factions.includes(faction)) return false;

      Player.startGang(faction);
      return true;
    },
    inGang: () => () => {
      return Player.gang ? true : false;
    },
    getMemberNames: (ctx) => () => {
      const gang = getGang(ctx);
      return gang.members.map((member) => member.name);
    },
    renameMember: (ctx) => (_memberName, _newName) => {
      const gang = getGang(ctx);
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const newName = helpers.string(ctx, "newName", _newName);
      const member = gang.members.find((m) => m.name === memberName);
      if (!memberName) {
        throw helpers.errorMessage(ctx, `Invalid memberName: "" (empty string)`);
      }
      if (!newName) {
        throw helpers.errorMessage(ctx, `Invalid newName: "" (empty string)`);
      }
      if (newName === memberName) {
        throw helpers.errorMessage(ctx, `newName and memberName must be different, but both were: ${newName}`);
      }
      if (!member) {
        helpers.log(ctx, () => `Failed to rename member: No member exists with memberName: ${memberName}`);
        return false;
      }
      if (gang.members.map((m) => m.name).includes(newName)) {
        helpers.log(ctx, () => `Failed to rename member: A different member already has the newName: ${newName}`);
        return false;
      }
      member.name = newName;
      helpers.log(ctx, () => `Renamed member from memberName: ${memberName} to newName: ${newName}`);
      return true;
    },
    getGangInformation: (ctx) => () => {
      const gang = getGang(ctx);
      return {
        faction: gang.facName,
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
      };
    },
    getOtherGangInformation: (ctx) => () => {
      getGang(ctx);
      const cpy: Record<string, GangOtherInfoObject> = {};
      for (const gang of Object.keys(AllGangs)) {
        cpy[gang] = Object.assign({}, AllGangs[gang]);
      }

      return cpy;
    },
    getMemberInformation: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const gang = getGang(ctx);
      const member = getGangMember(ctx, memberName);
      return {
        name: member.name,
        type: member.type,
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
      };
    },
    getMemberTypes: () => () => {
      return Object.values(GangMemberType);
    },
    canRecruitMember: (ctx) => () => {
      const gang = getGang(ctx);
      return gang.canRecruitMember();
    },
    getRecruitsAvailable: (ctx) => () => {
      const gang = getGang(ctx);
      return gang.getRecruitsAvailable();
    },
    respectForNextRecruit: (ctx) => () => {
      const gang = getGang(ctx);
      return gang.respectForNextRecruit();
    },
    getMemberTypeCount: (ctx) => (_type) => {
      const gang = getGang(ctx);
      const type = getEnumHelper("GangMemberType").nsGetMember(ctx, _type);
      return gang.members.filter((x) => x.type == type).length;
    },
    getMemberTypeMax: (ctx) => (_type) => {
      const gang = getGang(ctx);
      const type = getEnumHelper("GangMemberType").nsGetMember(ctx, _type);
      return gang.memberTypeMax(type);
    },
    recruitMember: (ctx) => (_memberName, _type) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const type = getEnumHelper("GangMemberType").nsGetMember(ctx, _type);
      const gang = getGang(ctx);
      const recruited = gang.recruitMember(memberName, type);
      if (memberName === "") {
        ctx.workerScript.log("gang.recruitMember", () => `Failed to recruit Gang Member. Name must be provided.`);
        return false;
      } else if (recruited) {
        ctx.workerScript.log("gang.recruitMember", () => `Successfully recruited Gang Member '${memberName}'`);
        return recruited;
      } else {
        ctx.workerScript.log(
          "gang.recruitMember",
          () => `Failed to recruit Gang Member '${memberName}'. Name already used or over the maximum amount.`,
        );
        return recruited;
      }
    },
    getTaskNames: (ctx) => () => {
      const gang = getGang(ctx);
      const tasks = gang.getAllTaskNames();
      return tasks;
    },
    getMemberTaskNames: (ctx) => (_memberName) => {
      const gang = getGang(ctx);
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const member = getGangMember(ctx, memberName);
      const tasks = gang.getAllTaskNames(member.type);
      return tasks;
    },
    setMemberTask: (ctx) => (_memberName, _taskName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const taskName = helpers.string(ctx, "taskName", _taskName);
      const gang = getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!gang.getAllTaskNames(member.type).includes(taskName)) {
        ctx.workerScript.log(
          "gang.setMemberTask",
          () =>
            `Failed to assign Gang Member '${memberName}' to Invalid task '${taskName}'. '${memberName}' is now Unassigned`,
        );
        return member.assignToTask("Unassigned");
      }
      const success = member.assignToTask(taskName);
      if (success) {
        ctx.workerScript.log(
          "gang.setMemberTask",
          () => `Successfully assigned Gang Member '${memberName}' to '${taskName}' task`,
        );
      } else {
        ctx.workerScript.log(
          "gang.setMemberTask",
          () => `Failed to assign Gang Member '${memberName}' to '${taskName}' task. '${memberName}' is now Unassigned`,
        );
      }

      return success;
    },
    getTaskStats: (ctx) => (_taskName) => {
      const taskName = helpers.string(ctx, "taskName", _taskName);
      getGang(ctx);
      const task = getGangTask(ctx, taskName);
      const copy = Object.assign({}, task);
      copy.territory = Object.assign({}, task.territory);
      return copy;
    },
    getEquipmentNames: (ctx) => () => {
      getGang(ctx);
      return Object.keys(GangMemberUpgrades);
    },
    getEquipmentCost: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      const gang = getGang(ctx);
      const upg = GangMemberUpgrades[equipName];
      if (upg === null) return Infinity;
      return gang.getUpgradeCost(upg);
    },
    getEquipmentType: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getGang(ctx);
      const upg = GangMemberUpgrades[equipName];
      if (upg == null) return "";
      return upg.getType();
    },
    getEquipmentStats: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getGang(ctx);
      const equipment = GangMemberUpgrades[equipName];
      if (!equipment) {
        throw helpers.errorMessage(ctx, `Invalid equipment: ${equipName}`);
      }
      const typecheck: EquipmentStats = equipment.mults;
      return Object.assign({}, typecheck);
    },
    purchaseEquipment: (ctx) => (_memberName, _equipName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getGang(ctx);
      const member = getGangMember(ctx, memberName);
      const equipment = GangMemberUpgrades[equipName];
      if (!equipment) return false;
      const res = member.buyUpgrade(equipment);
      if (res) {
        ctx.workerScript.log(
          "gang.purchaseEquipment",
          () => `Purchased '${equipName}' for Gang member '${memberName}'`,
        );
      } else {
        ctx.workerScript.log(
          "gang.purchaseEquipment",
          () => `Failed to purchase '${equipName}' for Gang member '${memberName}'`,
        );
      }

      return res;
    },
    ascendMember: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const gang = getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!member.canAscend()) return;
      return gang.ascendMember(member, ctx.workerScript);
    },
    getAscensionResult: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      getGang(ctx);
      const member = getGangMember(ctx, memberName);
      if (!member.canAscend()) return;
      return {
        respect: member.earnedRespect,
        ...member.getAscensionResults(),
      };
    },
    getInstallResult: (ctx) => (_memberName) => {
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
    setTerritoryWarfare: (ctx) => (_engage) => {
      const engage = !!_engage;
      const gang = getGang(ctx);
      if (engage) {
        gang.territoryWarfareEngaged = true;
        ctx.workerScript.log("gang.setTerritoryWarfare", () => "Engaging in Gang Territory Warfare");
      } else {
        gang.territoryWarfareEngaged = false;
        ctx.workerScript.log("gang.setTerritoryWarfare", () => "Disengaging in Gang Territory Warfare");
      }
    },
    getChanceToWinClash: (ctx) => (_otherGang) => {
      const otherGang = helpers.string(ctx, "otherGang", _otherGang);
      const gang = getGang(ctx);
      if (AllGangs[otherGang] == null) {
        throw helpers.errorMessage(ctx, `Invalid gang: ${otherGang}`);
      }

      const playerPower = AllGangs[gang.facName].power;
      const otherPower = AllGangs[otherGang].power;

      return playerPower / (otherPower + playerPower);
    },
    retireMember: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const gang = getGang(ctx);
      const member = gang.members.find((x) => x.name === memberName);
      if (!member) return false;
      gang.killMember(member, true);
      return true;
    },
    getBonusTime: (ctx) => () => {
      const gang = getGang(ctx);
      return Math.round(gang.storedCycles / 5) * 1000;
    },
    nextUpdate: (ctx) => () => {
      getGang(ctx);
      if (!GangPromise.promise) GangPromise.promise = new Promise<number>((res) => (GangPromise.resolve = res));
      return GangPromise.promise;
    },
  };
}
