import type { CharityORG as ICharityORG, EquipmentStats } from "@nsdefs";
import type { CharityORG } from "../CharityORG/CharityORG";
import type { CharityVolunteerTask } from "../CharityORG/CharityVolunteerTask";
import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { CharityResolvers } from "../CharityORG/CharityORG";
import { Player } from "@player";
import { CharityVolunteerTasks } from "../CharityORG/CharityVolunteerTasks";
import { CharityVolunteer } from "../CharityORG/CharityVolunteer";
import { CharityVolunteerUpgrades } from "../CharityORG/CharityVolunteerUpgrades";
import { helpers } from "../Netscript/NetscriptHelpers";
import { isBoolean } from "lodash";
import { joinFaction } from "../Faction/FactionHelpers";
import { Factions } from "../Faction/Factions";

export function NetscriptCharityORG(): InternalAPI<ICharityORG> {
  /** Functions as an API check and also returns the gang object */
  const getCharity = function (ctx: NetscriptContext): CharityORG {
    if (!Player.charityORG)
      throw helpers.makeRuntimeErrorMsg(ctx, "Must not have created a charity yet!", "API ACCESS");
    return Player.charityORG;
  };

  const getCharityVolunteer = function (ctx: NetscriptContext, name: string): CharityVolunteer {
    const charityORG = getCharity(ctx);
    for (const member of charityORG.volunteers) if (member.name === name) return member;
    throw helpers.makeRuntimeErrorMsg(ctx, `Invalid gang member: '${name}'`);
  };

  const getCharityTask = function (ctx: NetscriptContext, name: string): CharityVolunteerTask {
    const task = CharityVolunteerTasks[name];
    if (!task) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Invalid task: '${name}'`);
    }
    return task;
  };

  return {
    createCharity: () => (_name, _seed) => {
      const name = String(_name);
      let seed = false;
      if (isBoolean(_seed)) seed = _seed;
      else return false;

      if (!Player.canAccessCharity()) return false;
      if (Player.charityORG) return false;

      Player.startCharity(name, seed);
      if (!seed) Player.loseMoney(250e6, "charity");
      joinFaction(Factions.Charity);
      return true;
    },
    hasCharity: () => () => {
      return Player.charityORG ? true : false;
    },
    getVolunteerNames: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return charityORG.volunteers.map((member) => member.name);
    },
    renameVolunteer: (ctx) => (_memberName, _newName) => {
      const charityORG = getCharity(ctx);
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const newName = helpers.string(ctx, "newName", _newName);
      const member = charityORG.volunteers.find((m) => m.name === memberName);
      if (!memberName) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid memberName: "" (empty string)`);
      }
      if (!newName) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid newName: "" (empty string)`);
      }
      if (newName === memberName) {
        throw helpers.makeRuntimeErrorMsg(ctx, `newName and memberName must be different, but both were: ${newName}`);
      }
      if (!member) {
        helpers.log(ctx, () => `Failed to rename member: No member exists with memberName: ${memberName}`);
        return false;
      }
      if (charityORG.volunteers.map((m) => m.name).includes(newName)) {
        helpers.log(ctx, () => `Failed to rename member: A different member already has the newName: ${newName}`);
        return false;
      }
      member.name = newName;
      helpers.log(ctx, () => `Renamed member from memberName: ${memberName} to newName: ${newName}`);
      return true;
    },
    getCharityInformation: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return {
        name: charityORG.name,
        seedFunded: charityORG.seedFunded,
        bank: charityORG.bank,
        spent: charityORG.spent,
        visibility: charityORG.visibility,
        terror: charityORG.terror,
        prestige: charityORG.prestige,
        moneyGainRate: charityORG.moneyGainRate,
        moneySpendRate: charityORG.moneySpendRate,
        karmaGainRate: charityORG.karmaGainRate,
        prestigeGainRate: charityORG.prestigeGainRate,
        visibilityGainRate: charityORG.visibilityGainRate,
        terrorGainRate: charityORG.terrorGainRate,
        visibilityBooster: charityORG.visibilityBooster,
        terrorBooster: charityORG.terrorBooster,
      };
    },
    getVolunteerInformation: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const charityORG = getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      return {
        name: member.name,
        task: member.task,
        earnedPrestige: member.earnedPrestige,
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

        prestigeGain: member.calculatePrestigeGain(charityORG),
        karmaGain: member.calculateKarmaGain(charityORG),
        moneyGain: member.calculateMoneyGain(charityORG),
        moneySpend: member.calculateMoneySpend(charityORG),
        visibilityGain: member.calculateVisibilityGain(charityORG),
        terrorGain: member.calculateTerrorGain(charityORG),
      };
    },
    canRecruitVolunteer: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return charityORG.canRecruitMember();
    },
    prestigeForNextRecruit: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return charityORG.prestigeForNextRecruit();
    },
    recruitVolunteer: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const charityORG = getCharity(ctx);
      const recruited = charityORG.recruitMember(memberName);
      if (memberName === "") {
        ctx.workerScript.log(
          "charityORG.recruitVolunteer",
          () => `Failed to recruit Charity Volunteer. Name must be provided.`,
        );
        return false;
      } else if (recruited) {
        ctx.workerScript.log(
          "charityORG.recruitVolunteer",
          () => `Successfully recruited Charity Volunteer '${memberName}'`,
        );
        return recruited;
      } else {
        ctx.workerScript.log(
          "charityORG.recruitVolunteer",
          () => `Failed to recruit Charity Volunteer '${memberName}'. Name already used.`,
        );
        return recruited;
      }
    },
    getTaskNames: (ctx) => () => {
      const charityORG = getCharity(ctx);
      const tasks = charityORG.getAllTaskNames();
      tasks.unshift("Unassigned");
      return tasks;
    },
    setMemberTask: (ctx) => (_memberName, _taskName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const taskName = helpers.string(ctx, "taskName", _taskName);
      const charityORG = getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      if (!charityORG.getAllTaskNames().includes(taskName)) {
        ctx.workerScript.log(
          "charityORG.setMemberTask",
          () =>
            `Failed to assign Charity Volunteer '${memberName}' to Invalid task '${taskName}'. '${memberName}' is now Unassigned`,
        );
        return member.assignToTask("Unassigned");
      }
      const success = member.assignToTask(taskName);
      if (success) {
        ctx.workerScript.log(
          "charityORG.setMemberTask",
          () => `Successfully assigned Charity Volunteer '${memberName}' to '${taskName}' task`,
        );
      } else {
        ctx.workerScript.log(
          "charityORG.setMemberTask",
          () =>
            `Failed to assign Charity Volunteer '${memberName}' to '${taskName}' task. '${memberName}' is now Unassigned`,
        );
      }

      return success;
    },
    getTaskStats: (ctx) => (_taskName) => {
      const taskName = helpers.string(ctx, "taskName", _taskName);
      getCharity(ctx);
      const task = getCharityTask(ctx, taskName);
      const copy = Object.assign({}, task);
      return copy;
    },
    getEquipmentNames: (ctx) => () => {
      getCharity(ctx);
      return Object.keys(CharityVolunteerUpgrades);
    },
    getEquipmentCost: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      const charityORG = getCharity(ctx);
      const upg = CharityVolunteerUpgrades[equipName];
      if (upg === null) return Infinity;
      return charityORG.getUpgradeCost(upg);
    },
    getEquipmentType: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getCharity(ctx);
      const upg = CharityVolunteerUpgrades[equipName];
      if (upg == null) return "";
      return upg.getType();
    },
    getEquipmentStats: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getCharity(ctx);
      const equipment = CharityVolunteerUpgrades[equipName];
      if (!equipment) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid equipment: ${equipName}`);
      }
      const typecheck: EquipmentStats = equipment.mults;
      return Object.assign({}, typecheck);
    },
    purchaseEquipment: (ctx) => (_memberName, _equipName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      const equipment = CharityVolunteerUpgrades[equipName];
      if (!equipment) return false;
      const res = member.buyUpgrade(equipment);
      if (res) {
        ctx.workerScript.log(
          "charityORG.purchaseEquipment",
          () => `Purchased '${equipName}' for Charity Volunteer '${memberName}'`,
        );
      } else {
        ctx.workerScript.log(
          "charityORG.purchaseEquipment",
          () => `Failed to purchase '${equipName}' for Charity Volunteer '${memberName}'`,
        );
      }

      return res;
    },
    ascendMember: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const charityORG = getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      if (!member.canAscend()) return;
      return charityORG.ascendMember(member, ctx.workerScript);
    },
    getAscensionResult: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      if (!member.canAscend()) return;
      return {
        prestige: member.earnedPrestige,
        ...member.getAscensionResults(),
      };
    },

    getBonusTime: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return Math.floor(charityORG.storedCycles / 5) * 1000;
    },
    nextUpdate: () => () => {
      return new Promise<number>((res) => CharityResolvers.push(res));
    },
  };
}
