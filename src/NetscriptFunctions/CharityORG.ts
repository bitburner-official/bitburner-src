import type { CharityORG as ICharityORG, EquipmentStats, CharityEventGenData } from "@nsdefs";
import type { CharityORG } from "../CharityORG/CharityORG";
import type { CharityVolunteerTask } from "../CharityORG/CharityVolunteerTask";
import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { CharityResolvers } from "../CharityORG/CharityORG";
import { Player } from "@player";
import { CharityVolunteerTasks } from "../CharityORG/CharityVolunteerTasks";
import { CharityEventTasks } from "../CharityORG/CharityORG";
import { CharityVolunteer } from "../CharityORG/CharityVolunteer";
import { CharityVolunteerUpgrades } from "../CharityORG/CharityVolunteerUpgrades";
import { CharityORGConstants } from "../CharityORG/data/Constants";
import { helpers } from "../Netscript/NetscriptHelpers";
import { joinFaction } from "../Faction/FactionHelpers";
import { Factions } from "../Faction/Factions";
import { isString } from "../utils/helpers/string";
import { AugmentationName } from "@enums";
import { Augmentations } from "../Augmentation/Augmentations";
import { findAugs } from "../CharityORG/ui/KarmaSleeveAugmentsSubpage";
import { saveObject } from "../SaveObject";
import { Engine } from "../engine";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { formatNumber, formatMoney } from "../ui/formatNumber";
import { CharityEvent } from "../CharityORG/CharityEvent";
import { LotteryConstants } from "../Lottery/data/LotteryConstants";
import { buyRandomTicket } from "../Lottery/Lotto";
import { cloneDeep } from "lodash";

export function NetscriptCharityORG(): InternalAPI<ICharityORG> {
  /** Functions as an API check and also returns the charityORG object */
  const getCharity = function (ctx: NetscriptContext): CharityORG {
    if (!Player.charityORG)
      throw helpers.makeRuntimeErrorMsg(ctx, "Must not have created a charity yet!", "API ACCESS");
    return Player.charityORG;
  };

  const getCharityVolunteer = function (ctx: NetscriptContext, name: string): CharityVolunteer {
    const charityORG = getCharity(ctx);
    for (const member of charityORG.volunteers) if (member.name === name) return member;
    throw helpers.makeRuntimeErrorMsg(ctx, `Invalid volunteer: '${name}'`);
  };

  const getCharityTask = function (ctx: NetscriptContext, name: string): CharityVolunteerTask {
    const task = CharityVolunteerTasks[name];
    const task2 = CharityEventTasks[name];
    if (!task && !task2) {
      throw helpers.makeRuntimeErrorMsg(ctx, `Invalid task: '${name}'`);
    }
    return task ? task : task2;
  };

  return {
    createCharity: (ctx) => (_name, _seed) => {
      const name = String(_name);
      let seed = false;
      if (_seed === true || _seed === false) seed = _seed;
      else return false;

      if (!Player.canAccessCharity()) return false;
      if (Player.charityORG) return false;
      if (!seed && Player.money < CharityORGConstants.CharityMoneyRequirement) return false;

      Player.startCharity(name, seed);
      const charityORG = getCharity(ctx);
      if (!seed) {
        Player.loseMoney(CharityORGConstants.CharityMoneyRequirement, "charityORG");
        charityORG.ascensionToken += 50;
      } else charityORG.ascensionToken += 20;

      joinFaction(Factions.Charity);
      return true;
    },
    getPendingEvents: (ctx) => () => {
      const charityORG = getCharity(ctx);
      const list: CharityEventGenData[] = [];
      for (const event of charityORG.waitingEvents) {
        const record = {
          name: event.name,
          short_name: event.short_name,
          desc: event.desc,
          task: event.taskObject,
          hasTimer: event.hasTimer,
          cyclesCompleted: event.cyclesCompleted,
          cyclesElapsed: event.cyclesElapsed,
          cyclesNeeded: event.cyclesNeeded,
          cyclesTillDeath: event.cyclesTillDeath,
          cyclesTillRemoved: event.cyclesTillRemoved,
          deathEffects: event.deathEffects,
          modifiers: event.modifiers,
        };
        list.push(record);
      }
      return list;
    },
    getCurrentEvents: (ctx) => () => {
      const charityORG = getCharity(ctx);
      const list: CharityEventGenData[] = [];
      for (const event of charityORG.currentEvents.filter((f) => f.isBeneficial)) {
        const record = {
          name: event.name,
          short_name: event.short_name,
          desc: event.desc,
          task: event.taskObject,
          hasTimer: event.hasTimer,
          cyclesCompleted: event.cyclesCompleted,
          cyclesElapsed: event.cyclesElapsed,
          cyclesNeeded: event.cyclesNeeded,
          cyclesTillDeath: event.cyclesTillDeath,
          cyclesTillRemoved: event.cyclesTillRemoved,
          deathEffects: event.deathEffects,
          modifiers: event.modifiers,
        };
        list.push(record);
      }
      return list;
    },
    getAttackEvents: (ctx) => () => {
      const charityORG = getCharity(ctx);
      const list: CharityEventGenData[] = [];
      for (const event of charityORG.currentEvents.filter((f) => !f.isBeneficial)) {
        const record = {
          name: event.name,
          short_name: event.short_name,
          desc: event.desc,
          task: event.taskObject,
          hasTimer: event.hasTimer,
          cyclesCompleted: event.cyclesCompleted,
          cyclesElapsed: event.cyclesElapsed,
          cyclesNeeded: event.cyclesNeeded,
          cyclesTillDeath: event.cyclesTillDeath,
          cyclesTillRemoved: event.cyclesTillRemoved,
          deathEffects: event.deathEffects,
          modifiers: event.modifiers,
        };
        list.push(record);
      }
      return list;
    },
    acceptEvent: (ctx) => (_name) => {
      const name = helpers.string(ctx, "name", _name);
      const charityORG = getCharity(ctx);
      const event = charityORG.waitingEvents.find((f) => f.name === name);
      if (event === undefined) return false;
      const index = charityORG.waitingEvents.indexOf(event);
      charityORG.waitingEvents.splice(index, 1);
      event.cyclesElapsed = 0;
      charityORG.currentEvents.push(event);
      charityORG.addMessage("Accepted: " + event.short_name);
      charityORG.processNewEvents(0);
      return true;
    },
    abandonEvent: (ctx) => (_name) => {
      const name = helpers.string(ctx, "name", _name);
      const charityORG = getCharity(ctx);
      const event = charityORG.currentEvents.find((f) => f.name === name);
      if (event === undefined) return false;
      const index = charityORG.currentEvents.indexOf(event);
      charityORG.currentEvents.splice(index, 1);
      charityORG.addMessage("Abandoned: " + event.short_name);
      charityORG.processNewEvents(0);
      event.processDeath();
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
    getCharityInfo: (ctx) => () => {
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
        cycles: charityORG.storedCycles,
      };
    },
    getVolunteerInfo: (ctx) => (_memberName) => {
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
    prestigeForNextVolunteer: (ctx) => () => {
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
    getVolunteerTasks: (ctx) => () => {
      const charityORG = getCharity(ctx);
      const tasks = charityORG.getAllTaskNames();
      tasks.unshift("Unassigned");
      return tasks;
    },
    setVolunteerTask: (ctx) => (_memberName, _taskName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const taskName = helpers.string(ctx, "taskName", _taskName);
      const charityORG = getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      if (!charityORG.getAllTaskNames().includes(taskName)) {
        ctx.workerScript.log(
          "charityORG.setVolunteerTask",
          () =>
            `Failed to assign Charity Volunteer '${memberName}' to Invalid task '${taskName}'. '${memberName}' is now Unassigned`,
        );
        return member.assignToTask("Unassigned");
      }
      const success = member.assignToTask(taskName);
      if (success) {
        ctx.workerScript.log(
          "charityORG.setVolunteerTask",
          () => `Successfully assigned Charity Volunteer '${memberName}' to '${taskName}' task`,
        );
      } else {
        ctx.workerScript.log(
          "charityORG.setVolunteerTask",
          () =>
            `Failed to assign Charity Volunteer '${memberName}' to '${taskName}' task. '${memberName}' is now Unassigned`,
        );
      }

      return success;
    },
    getVolunteerTaskStats: (ctx) => (_taskName) => {
      const taskName = helpers.string(ctx, "taskName", _taskName);
      getCharity(ctx);
      const task = getCharityTask(ctx, taskName);
      const copy = Object.assign({}, task);
      return copy;
    },
    getEqNames: (ctx) => () => {
      getCharity(ctx);
      return Object.keys(CharityVolunteerUpgrades);
    },
    getEqCost: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      const charityORG = getCharity(ctx);
      const upg = CharityVolunteerUpgrades[equipName];
      if (upg === null) return Infinity;
      return charityORG.getUpgradeCost(upg);
    },
    getEqType: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getCharity(ctx);
      const upg = CharityVolunteerUpgrades[equipName];
      if (upg == null) return "";
      return upg.getType();
    },
    getEqStats: (ctx) => (_equipName) => {
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getCharity(ctx);
      const equipment = CharityVolunteerUpgrades[equipName];
      if (!equipment) {
        throw helpers.makeRuntimeErrorMsg(ctx, `Invalid equipment: ${equipName}`);
      }
      const typecheck: EquipmentStats = equipment.mults;
      return Object.assign({}, typecheck);
    },
    purchaseEq: (ctx) => (_memberName, _equipName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const equipName = helpers.string(ctx, "equipName", _equipName);
      getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      const equipment = CharityVolunteerUpgrades[equipName];
      if (!equipment) return false;
      const res = member.buyUpgrade(equipment);
      if (res) {
        ctx.workerScript.log(
          "charityORG.purchaseEq",
          () => `Purchased '${equipName}' for Charity Volunteer '${memberName}'`,
        );
      } else {
        ctx.workerScript.log(
          "charityORG.purchaseEq",
          () => `Failed to purchase '${equipName}' for Charity Volunteer '${memberName}'`,
        );
      }

      return res;
    },
    ascendVolunteer: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      const charityORG = getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      if (!member.canAscend()) return;
      if (charityORG.ascensionToken < 1) return;
      charityORG.ascensionToken--;
      return charityORG.ascendMember(member, ctx.workerScript);
    },
    getAscResult: (ctx) => (_memberName) => {
      const memberName = helpers.string(ctx, "memberName", _memberName);
      getCharity(ctx);
      const member = getCharityVolunteer(ctx, memberName);
      if (!member.canAscend()) return;
      return {
        prestige: member.earnedPrestige,
        ...member.getAscensionResults(),
      };
    },
    getCharityBonusTime: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return Math.floor(charityORG.storedCycles / 5) * 1000;
    },
    useItem: (ctx) => (_item, _spend, _convert) => {
      const charityORG = getCharity(ctx);
      const item = helpers.string(ctx, "item", _item).toLowerCase();
      const spend = Math.floor(helpers.number(ctx, "spend", _spend));
      const convert = _convert === true || _convert === false ? _convert : false;
      if (spend === 0) return false;

      switch (item) {
        case "lucky coins": {
          //Cannot convert a lucky coin
          if (convert || spend < 0) return false;
          const quantomCost =
            Player.quantomTickets >= LotteryConstants.MaxTickets
              ? Number.POSITIVE_INFINITY
              : Player.quantomTickets * 2 + 1;
          if (
            spend > charityORG.luckyCoin ||
            spend < quantomCost ||
            Player.quantomTickets >= LotteryConstants.MaxTickets
          )
            return false;
          Player.quantomTickets++;
          //Safeguard against overspending
          charityORG.luckyCoin -= quantomCost;
          charityORG.addItemUseMessage("Purchased a Quantom Ticket!");
          return true;
        }
        case "ascension tokens": {
          //No option to spend regularly.  Other commands for that.
          if (!convert || spend < 0) return false;
          if (spend > charityORG.luckyCoin) return false;
          charityORG.ascensionToken += 5 * spend;
          charityORG.luckyCoin -= spend;
          charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " ascension tokens");
          return true;
        }
        case "decoy juice": {
          if (spend < 0) return false;
          switch (convert) {
            case true:
              if (spend > charityORG.luckyCoin) return false;
              charityORG.decoyJuice += 5 * spend;
              charityORG.luckyCoin -= spend;
              charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " decoy juice");
              return true;
            case false: {
              if (spend > charityORG.decoyJuice) return false;

              const decoyTime = spend * (5 * 60);
              if (charityORG.fastAttacks > 0) {
                if (charityORG.fastAttacks > decoyTime) charityORG.fastAttacks -= decoyTime;
                else {
                  charityORG.stopAttacks += decoyTime - charityORG.fastAttacks;
                  charityORG.fastAttacks = 0;
                }
              } else {
                charityORG.stopAttacks += decoyTime;
              }
              charityORG.decoyJuice -= spend;
              charityORG.addItemUseMessage("Used " + spend + " decoy juice for " + decoyTime + " stop attack time.");
              return true;
            }
            default:
              return false;
          }
        }
        case "random dice": {
          switch (convert) {
            case true:
              if (spend > charityORG.luckyCoin) return false;
              charityORG.randomDice += 5 * spend;
              charityORG.luckyCoin -= spend;
              charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " decoy juice");
              return true;
            case false:
              if (Math.abs(spend) > charityORG.randomDice) return false;
              charityORG.random += spend;
              charityORG.randomDice -= Math.abs(spend);
              charityORG.addItemUseMessage("Used " + Math.abs(spend) + " random dice for " + spend + " random events.");
              return true;
            default:
              return false;
          }
        }
        case "java juice": {
          if (spend < 0) return false;
          switch (convert) {
            case true:
              if (spend > charityORG.luckyCoin) return false;
              charityORG.javaJuice += 5 * spend;
              charityORG.luckyCoin -= spend;
              charityORG.addItemUseMessage("Converted " + spend + " lucky coins into " + spend * 5 + " java juice");
              return true;
            case false: {
              if (spend > charityORG.javaJuice) return false;
              const taskTime = spend * (5 * 60);
              if (charityORG.slowTasks > 0) {
                if (charityORG.slowTasks > taskTime) charityORG.slowTasks -= taskTime;
                else {
                  charityORG.fastTasks += taskTime - charityORG.slowTasks;
                  charityORG.slowTasks = 0;
                }
              } else {
                charityORG.fastTasks += taskTime;
              }
              charityORG.javaJuice -= spend;
              charityORG.addItemUseMessage("Used " + spend + " java juice for " + taskTime + " fast task time.");
              return true;
            }
            default:
              return false;
          }
        }
        case "ticket stub": {
          if (spend < 0) return false;
          switch (convert) {
            case true:
              if (spend > charityORG.luckyCoin) return false;
              charityORG.ticketStub += 1000 * spend;
              charityORG.luckyCoin -= spend;
              charityORG.addItemUseMessage(
                "Converted " + spend + " lucky coins into " + spend * 1000 + " ticket stubs",
              );
              return true;
            case false:
              if (Player.lotteryTickets.length + spend >= LotteryConstants.MaxTickets || spend > charityORG.ticketStub)
                return false;
              for (let i = 0; i < spend; i++) buyRandomTicket();
              charityORG.addItemUseMessage(
                "Used " + spend + " ticket stubs and purchased " + spend + " lottery tickets.",
              );
              charityORG.ticketStub -= spend;
              return true;
            default:
              return false;
          }
        }
        default:
          ctx.workerScript.log("charityORG.useItem", () => `Failed to use invalid item: ${item}`);
          return false;
      }
    },
    luckyCancel: (ctx) => (_event) => {
      const charityORG = getCharity(ctx);
      if (charityORG.luckyCoin < 1) {
        ctx.workerScript.log("charityORG.luckyCancel", () => `Failed to cancel due to lack of lucky coins.`);
        return false;
      }
      const eventName = helpers.string(ctx, "event", _event);
      const event = charityORG.currentEvents.concat(charityORG.waitingEvents).find((f) => f.name === eventName);
      if (!event) {
        ctx.workerScript.log("charityORG.luckyCancel", () => `Failed to cancel invalid event: '${eventName}'.`);
        return false;
      }
      //Find and remove the event
      charityORG.currentEvents.filter((f) => f === event);
      charityORG.waitingEvents.filter((f) => f === event);
      charityORG.luckyCoin--;
      charityORG.addItemUseMessage("Lucky Cancelled: " + event.short_name);
      event.processRemoval();
      charityORG.processNewEvents(0);
      return true;
    },
    luckyReset: (ctx) => () => {
      const charityORG = getCharity(ctx);
      if (charityORG.luckyCoin < 1) {
        ctx.workerScript.log("charityORG.luckyReset", () => `Failed to reset due to lack of lucky coins.`);
        return false;
      }
      if (charityORG.currentEvents.filter((f) => f.isBeneficial).length > 0) {
        ctx.workerScript.log("charityORG.luckyReset", () => `Failed to reset due to existing events.`);
        return false;
      }
      charityORG.waitingEvents.length = 0;

      for (let i = 0; i < 5; i++) {
        const event = new CharityEvent("good event", true, false, 10000);
        event.randomize(true);
        charityORG.waitingEvents.push(event);

        const fundraise = new CharityEvent("good event", true, false, 10000);
        fundraise.randomize(true, true);
        charityORG.waitingEvents.push(fundraise);
      }

      charityORG.addItemUseMessage("Lucky Refreshed!");
      charityORG.luckyCoin--;
      charityORG.processNewEvents(0);
      return true;
    },
    getRarity: (ctx) => (_event) => {
      const charityORG = getCharity(ctx);
      if (Player.sourceFileLvl(15) < 3 && Player.bitNodeN !== 15) {
        throw helpers.makeRuntimeErrorMsg(
          ctx,
          `You do not have access to getRarity yet!  Get SF 15.3 in order to unlock outside of BN 15.`,
        );
      }
      const eventName = helpers.string(ctx, "event", _event);
      const event = charityORG.currentEvents.concat(charityORG.waitingEvents).find((f) => f.name === eventName);
      //Do we have the event?
      if (!event) {
        ctx.workerScript.log("charityORG.getRarity", () => `Failed to get Rarity of invalid event: '${eventName}'.`);
        return -1;
      } else {
        return event.rarity;
      }
    },
    getItems: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return {
        luckyCoin: charityORG.luckyCoin,
        ascensionToken: charityORG.ascensionToken,
        decoyJuice: charityORG.decoyJuice,
        javaJuice: charityORG.javaJuice,
        ticketStub: charityORG.ticketStub,
      };
    },
    getEffects: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return {
        modifiers: cloneDeep(charityORG.masterModifiers),
        visBooster: charityORG.visibilityBooster,
        visDrain: charityORG.visibilityDrain,
        terrorBooster: charityORG.terrorBooster,
        terrorDrain: charityORG.terrorDrain,
        stopAttacks: charityORG.stopAttacks,
        fastAttacks: charityORG.fastAttacks,
        fastTasks: charityORG.fastTasks,
        slowTasks: charityORG.slowTasks,
        random: charityORG.random,
      };
    },
    getMessages: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return {
        messages: cloneDeep(charityORG.messages),
        itemMessages: cloneDeep(charityORG.itemMessages),
        itemUseMessages: cloneDeep(charityORG.itemUseMessages),
        karmaMessages: cloneDeep(charityORG.karmaMessages),
      };
    },
    getCharityBanner: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return {
        lucky: charityORG.luck,
        totalPower: charityORG.bannerPower,
        banner: cloneDeep(charityORG.charityAugment),
      };
    },
    getStoredPieces: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return cloneDeep(charityORG.bannerPiecesStore);
    },
    getActivePieces: (ctx) => () => {
      const charityORG = getCharity(ctx);
      return cloneDeep(charityORG.bannerPieces);
    },
    activatePiece: (ctx) => (_name) => {
      const charityORG = getCharity(ctx);
      if (charityORG.bannerPieces.length >= CharityORGConstants.CharityMaxActivePieces) return false;
      const name = helpers.string(ctx, "name", _name);
      const piece = charityORG.bannerPiecesStore.find((p) => p.name === name);
      if (piece === undefined) return false;
      const index = charityORG.bannerPiecesStore.indexOf(piece);
      charityORG.bannerPiecesStore.splice(index, 1);
      charityORG.bannerPieces.push(piece);
      charityORG.addItemUseMessage("Activated banner piece: " + piece.short_name);
      charityORG.resetBanner();
      return true;
    },
    luckyRemove: (ctx) => (_name) => {
      const charityORG = getCharity(ctx);
      if (charityORG.luckyCoin < 1) return false;
      const name = helpers.string(ctx, "name", _name);
      const piece = charityORG.bannerPieces.find((p) => p.name === name);
      if (piece === undefined) return false;
      const index = charityORG.bannerPieces.indexOf(piece);
      charityORG.bannerPieces.splice(index, 1);
      charityORG.bannerPiecesStore.push(piece);
      charityORG.addItemUseMessage("Lucky removed banner piece: " + piece.short_name);
      charityORG.luckyCoin--;
      charityORG.resetBanner();
      return true;
    },
    destroyPiece: (ctx) => (_name) => {
      const charityORG = getCharity(ctx);
      const name = helpers.string(ctx, "name", _name);
      const piece1 = charityORG.bannerPieces.find((p) => p.name === name);
      const piece2 = charityORG.bannerPiecesStore.find((p) => p.name === name);
      if (piece1 !== undefined) {
        const index = charityORG.bannerPieces.indexOf(piece1);
        charityORG.bannerPieces.splice(index, 1);
        charityORG.addItemUseMessage("Destroyed banner piece: " + piece1.short_name);
        charityORG.resetBanner();
        return true;
      } else if (piece2 !== undefined) {
        const index = charityORG.bannerPiecesStore.indexOf(piece2);
        charityORG.bannerPiecesStore.splice(index, 1);
        charityORG.addItemUseMessage("Destroyed stored banner piece: " + piece2.short_name);
        return true;
      } else return false;
    },
    //The big one
    spendKarma: (ctx) => (_opt1, _opt2, _spendOn, _opt3) => {
      const charityORG = getCharity(ctx);
      const spend = Math.max(Math.floor(helpers.number(ctx, "spendOn", _spendOn)), 0);
      const aug = isString(_spendOn) ? helpers.string(ctx, "spendOn", _spendOn) : null;
      const opt1 = helpers.string(ctx, "opt1", _opt1).toLowerCase();
      const opt2 = helpers.string(ctx, "opt1", _opt2).toLowerCase();
      const opt3 = isString(_opt3)
        ? helpers.string(ctx, "opt3", _opt3).toLowerCase()
        : _opt3 === null
        ? null
        : helpers.number(ctx, "opt3", _opt3);

      if (Player.karma < spend || spend === 0) {
        return false;
      }

      switch (opt1) {
        case "boost charity": {
          switch (opt2) {
            case "bank": {
              charityORG.bank += spend * 100000;
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatMoney(spend * 100000) + " for the bank",
              );
              return true;
            }
            case "debt relief": {
              if (spend <= 100) return false;
              const startmoney = charityORG.bank;
              charityORG.bank /= spend / 100;
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " +
                  formatNumber(spend, 0) +
                  " on " +
                  formatMoney((charityORG.bank - startmoney) * -1) +
                  " dedt relief",
              );
              return true;
            }
            case "prestige": {
              const div = (spend * 5) / charityORG.volunteers.length;
              for (const volunteer of charityORG.volunteers) {
                volunteer.earnedPrestige += div;
              }
              charityORG.prestige += spend * 5;
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 2) + " prestige",
              );
              return true;
            }
            case "boost visibility": {
              const visPoints = (spend * 5) / 4;
              if (charityORG.visibilityDrain > 0) {
                if (charityORG.visibilityDrain >= visPoints) charityORG.visibilityDrain -= visPoints;
                else {
                  charityORG.visibilityBooster += visPoints - charityORG.visibilityDrain;
                  charityORG.visibilityDrain = 0;
                }
              } else {
                charityORG.visibilityBooster += visPoints;
              }
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 2) + " visibility boost",
              );
              Player.karma -= spend;
              return true;
            }
            case "reduce terror": {
              const terrorPoints = (spend * 5) / 4;
              if (charityORG.terrorDrain > 0) {
                if (charityORG.terrorDrain >= terrorPoints) charityORG.terrorDrain -= terrorPoints;
                else {
                  charityORG.terrorBooster += terrorPoints - charityORG.terrorDrain;
                  charityORG.terrorDrain = 0;
                }
              } else {
                charityORG.terrorBooster += terrorPoints;
              }
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 2) + " terror boost",
              );
              Player.karma -= spend;
              return true;
            }
            case "slow attacks": {
              if (charityORG.fastAttacks > 0) {
                const slowAtksPtsNeeded = (charityORG.fastAttacks / 5) * 4;
                const slowAtksPointsTotal = (spend * 5) / 4;
                if (slowAtksPtsNeeded >= slowAtksPointsTotal) {
                  charityORG.fastAttacks -= slowAtksPointsTotal;
                  Player.karma -= spend;
                  charityORG.addKarmaMessage(
                    "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 5, 2) + " slow attakcs",
                  );
                } else {
                  charityORG.fastAttacks = 0;
                  Player.karma -= (slowAtksPtsNeeded / 5) * 4;
                  charityORG.addKarmaMessage(
                    "Spent " +
                      formatNumber((slowAtksPtsNeeded / 5) * 4, 0) +
                      " on " +
                      formatNumber((slowAtksPtsNeeded / 5) * 4 * 5, 2) +
                      " slow attakcs",
                  );
                }
                return true;
              }
              return false;
            }
            case "fast tasks": {
              const fTaskPoints = (spend * 5) / 4;
              if (charityORG.slowTasks > 0) {
                if (charityORG.slowTasks >= fTaskPoints) charityORG.slowTasks -= fTaskPoints;
                else {
                  charityORG.fastTasks += fTaskPoints - charityORG.slowTasks;
                  charityORG.slowTasks = 0;
                }
              } else {
                charityORG.fastTasks += fTaskPoints;
              }
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatNumber(fTaskPoints, 2) + " fast tasks",
              );
              Player.karma -= spend;
              return true;
            }
            case "time booster": {
              const timePoints = (spend * 5) / 4;
              charityORG.storedCycles += timePoints;
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatNumber(timePoints, 2) + " time boost",
              );
              break;
            }
            case "reputation": {
              Factions.Charity.playerReputation += spend * 10;
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 10, 2) + " reputation",
              );
              return true;
            }
            case "see the truth": {
              // Not sure if this will stay
              if (Player.hasAugmentation(AugmentationName.TheRedPill, false)) {
                return false;
              } else if (spend < 5000000000000) {
                return false;
              } else {
                Player.queueAugmentation(AugmentationName.TheRedPill);
                Player.karma -= 5000000000000;
                return true;
              }
            }
            default:
              return false;
          }
          return false;
        }
        case "sleeves": {
          if (opt3 === null) return false; // Need opt3 for sleeve action
          switch (opt2) {
            //aug should be either an augment or "list" and opt3 will be either a sleeve number or "all"
            case "overclock": {
              if (!isString(opt3) && Player.sleeves.length <= Number(opt3)) {
                Player.sleeves[Number(opt3)].storedCycles += spend * 2.5;
                Player.karma -= spend;
                charityORG.addKarmaMessage(
                  "Spent " +
                    formatNumber(spend, 0) +
                    " on " +
                    formatNumber(spend * 2.5, 2) +
                    " overclock for sleeve #" +
                    opt3,
                );
                return true;
              } else if (isString(opt3) && opt3 === "all") {
                const div = (spend * 2.5) / Player.sleeves.length;
                for (const slv of Player.sleeves) {
                  slv.storedCycles += div;
                }
                charityORG.addKarmaMessage(
                  "Spent " +
                    formatNumber(spend, 0) +
                    " on " +
                    formatNumber(spend * 2.5, 2) +
                    " overclock for All sleeves",
                );
                Player.karma -= spend;
                return true;
              } else {
                return false;
              }
            }
            case "reduce shock": {
              if (!isString(opt3) && Player.sleeves.length <= Number(opt3)) {
                Player.sleeves[Number(opt3)].shock -= spend * 0.01;
                Player.karma -= spend;
                charityORG.addKarmaMessage(
                  "Spent " +
                    formatNumber(spend, 0) +
                    " on " +
                    formatNumber(spend * 2.5, 2) +
                    " reduce shock for sleeve #" +
                    opt3,
                );
                return true;
              } else if (isString(opt3) && opt3 === "all") {
                const div = (spend * 0.01) / Player.sleeves.length;
                for (const slv of Player.sleeves) {
                  slv.shock -= div;
                }
                charityORG.addKarmaMessage(
                  "Spent " +
                    formatNumber(spend, 0) +
                    " on " +
                    formatNumber(spend * 2.5, 2) +
                    " reduce shock for All sleeves",
                );
                Player.karma -= spend;
                return true;
              } else {
                return false;
              }
            }
            case "sync up": {
              if (!isString(opt3) && Player.sleeves.length <= Number(opt3)) {
                Player.sleeves[Number(opt3)].sync += spend * 0.01;
                Player.karma -= spend;
                charityORG.addKarmaMessage(
                  "Spent " +
                    formatNumber(spend, 0) +
                    " on " +
                    formatNumber(spend * 2.5, 2) +
                    " sync for sleeve #" +
                    opt3,
                );
                return true;
              } else if (isString(opt3) && opt3 === "all") {
                const div = (spend * 0.01) / Player.sleeves.length;
                for (const slv of Player.sleeves) {
                  slv.sync += div;
                }
                charityORG.addKarmaMessage(
                  "Spent " + formatNumber(spend, 0) + " on " + formatNumber(spend * 2.5, 2) + " sync for All sleeves",
                );
                Player.karma -= spend;
                return true;
              } else {
                return false;
              }
            }
            case "augments": {
              if (aug === "list" && !isString(opt3))
                return findAugs(Player.sleeves[opt3]).map((a) => a.name.toString());
              else if (aug != null && !Augmentations[aug as AugmentationName]) return false;
              else if (!isString(opt3) && aug != null && Number(opt3) < Player.sleeves.length) {
                const augs = findAugs(Player.sleeves[Number(opt3)]).map((a) => a.name.toString());
                if (Player.sleeves[Number(opt3)].hasAugmentation(aug)) return false;
                if (!augs.includes(aug)) return false;
                if (Player.karma < Math.sqrt(Augmentations[aug as AugmentationName].baseCost * 2)) return false;
                Player.sleeves[Number(opt3)].installAugmentation(Augmentations[aug as AugmentationName]);
                Player.karma -= Math.sqrt(Augmentations[aug as AugmentationName].baseCost * 2);
                charityORG.addKarmaMessage(
                  "Spent " +
                    formatNumber(Math.sqrt(Augmentations[aug as AugmentationName].baseCost * 2), 2) +
                    " on " +
                    aug +
                    " for sleeves #" +
                    opt3,
                );
                return true;
              }
              return false;
            }
            default:
              return false;
          }
        }
        case "time": {
          switch (opt2) {
            case "time orb": {
              const timeskiporb = Math.floor((spend / 10) * 1000 - (spend / 10) * 1000 * ((Math.random() * 90) / 100));
              dialogBoxCreate(
                "Spent " +
                  spend +
                  "Karma for " +
                  convertTimeMsToTimeElapsedString((spend / 10) * 1000, true) +
                  "Seconds\n" +
                  "Received: " +
                  convertTimeMsToTimeElapsedString(timeskiporb, true) +
                  " After Drain\n\n" +
                  "Hold on for the reboot!",
              );
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " +
                  formatNumber(spend, 0) +
                  " on Time Orb resulting in " +
                  convertTimeMsToTimeElapsedString(timeskiporb, true) +
                  " time after drain.",
              );
              Player.lastUpdate -= timeskiporb;
              Engine._lastUpdate -= timeskiporb;
              saveObject.saveGame();
              setTimeout(() => location.reload(), 1000);
              return true;
            }
            case "time gate": {
              const timeskipgate = Math.floor((spend / 20) * 1000 - (spend / 20) * 1000 * ((Math.random() * 30) / 100));
              dialogBoxCreate(
                "Spent " +
                  spend +
                  "Karma for " +
                  convertTimeMsToTimeElapsedString((spend / 20) * 1000, true) +
                  "Seconds\n" +
                  "Received: " +
                  convertTimeMsToTimeElapsedString(timeskipgate, true) +
                  " After Drain\n\n" +
                  "Hold on for the reboot!",
              );
              Player.karma -= spend;
              charityORG.addKarmaMessage(
                "Spent " +
                  formatNumber(spend, 0) +
                  " on Time Gate resulting in " +
                  convertTimeMsToTimeElapsedString(timeskipgate, true) +
                  " time after drain.",
              );
              Player.lastUpdate -= timeskipgate;
              Engine._lastUpdate -= timeskipgate;
              saveObject.saveGame();
              setTimeout(() => location.reload(), 1000);
              return true;
            }
            default:
              return false;
          }
        }
        default:
          return false;
      }
    },
    nextUpdate: () => () => {
      return new Promise<number>((res) => CharityResolvers.push(res));
    },
  };
}
