import { Player } from "@player";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Factions } from "../Faction/Factions";
import { CharityORGConstants } from "./data/Constants";
import { CharityVolunteerTask } from "./CharityVolunteerTask";
import { formatNumber } from "../ui/formatNumber";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
//import { Augmentation } from "../Augmentation/Augmentation";
//import { AugmentationName } from "../Enums";

export enum ModifyAreas {
  money_gain = "money_gain",
  money_spend = "money_spend",
  karma_gain = "karma_gain",
  prestige_gain = "prestige_gain",
  visibility_gain = "visibility_gain",
  terror_gain = "terror_gain",
}

export class Modifier {
  area: ModifyAreas;
  strength: number;

  constructor(area: ModifyAreas, strength: number) {
    this.area = area;
    this.strength = strength;
  }
}

export enum AugmentationAreas {
  hacking = "hacking",
  strength = "strength",
  defense = "defense",
  dexterity = "dexterity",
  agility = "agility",
  charisma = "charisma",
  hacking_exp = "hacking_exp",
  strength_exp = "strength_exp",
  defense_exp = "defense_exp",
  dexterity_exp = "dexterity_exp",
  agility_exp = "agility_exp",
  charisma_exp = "charisma_exp",
  hacking_chance = "hacking_chance",
  hacking_speed = "hacking_speed",
  hacking_money = "hacking_money",
  hacking_grow = "hacking_grow",
  company_rep = "company_rep",
  faction_rep = "faction_rep",
  crime_money = "crime_money",
  crime_success = "crime_success",
  charity_money = "charity_money",
  charity_success = "charity_success",
  work_money = "work_money",
  hacknet_node_money = "hacknet_node_money",
  hacknet_node_purchase_cost = "hacknet_node_purchase_cost",
  hacknet_node_ram_cost = "hacknet_node_ram_cost",
  hacknet_node_core_cost = "hacknet_node_core_cost",
  hacknet_node_level_cost = "hacknet_node_level_cost",
  bladeburner_max_stamina = "bladeburner_max_stamina",
  bladeburner_stamina_gain = "bladeburner_stamina_gain",
  bladeburner_analysis = "bladeburner_analysis",
  bladeburner_success_chance = "bladeburner_success_chance",
  lucky = "lucky",
}

class BannerFragment {
  effect: AugmentationAreas;
  strength: number;
  constructor(effect: AugmentationAreas, strength: number) {
    this.effect = effect;
    this.strength = strength;
  }
}

export class BannerPiece {
  effects: BannerFragment[];
  totalPower: number;
  name: string;
  short_name: string;

  constructor(name: string, short_name: string) {
    this.effects = [];
    this.totalPower = 0;
    this.name = name;
    this.short_name = short_name;
  }
}
enum DeathEffectTypes {
  visibility_boost = "visibility_boost",
  visibility_drain = "visibility_drain",
  terror_boost = "terror_boost",
  terror_drain = "terror_drain",
  attack_boost = "attack_boost",
  attack_stop = "attack_stop",
  task_boost = "task_boost",
  task_drain = "task_drain",
  bank = "bank",
  karma = "karma",
  death = "death",
  prestige = "prestige",
  bonus_time = "bonus_time",
  money = "money",
  random_event = "random_event",
}
class DeathEffect {
  type: DeathEffectTypes;
  strength: number;

  constructor(type: DeathEffectTypes, strength: number) {
    this.type = type;
    this.strength = strength;
  }
}

export class CharityEvent {
  name: string;
  short_name: string;
  desc: string;
  hasTimer: boolean;
  isBeneficial: boolean;
  taskObject: CharityVolunteerTask;
  modifiers: Modifier[]; //How to handle the modifiers to gain rate.  Short info here, larger info later?  All info here, no thought later?
  cyclesCompleted: number;
  cyclesNeeded: number;
  cyclesElapsed: number;
  cyclesTillDeath: number;
  cyclesTillRemoved: number;
  deathEffects: DeathEffect[]; // Larger, one time effects that occure when the timer runs out.
  rarity: number;
  prizeLevel: number;

  constructor(name = "My Charity Event", isBeneficial = true, hasTimer = true, rarity = 1) {
    this.name = name;
    this.short_name = "";
    this.desc = "";
    this.hasTimer = hasTimer;
    this.isBeneficial = isBeneficial;
    this.taskObject = new CharityVolunteerTask(
      this.isBeneficial ? "Good" : "Bad",
      this.isBeneficial ? "Good description" : "Bad description",
      true,
      { hackWeight: 100, difficulty: 1 },
    );
    this.modifiers = []; //How to handle the modifiers to gain rate.  Short info here, larger info later?  All info here, no thought later?
    this.cyclesCompleted = 0;
    this.cyclesNeeded = 100;
    this.cyclesElapsed = 0;
    this.cyclesTillDeath = 10000;
    this.cyclesTillRemoved = 1000;
    this.deathEffects = []; // Larger, one time effects that occure when the timer runs out.
    this.rarity = rarity;
    this.prizeLevel = 1;
  }

  /** Main process function called by the engine loop every game cycle
   * @param numCycles The number of cycles to process. */
  process(numCycles = 1): void {
    //Default numCycles from system is 1, 1000 is 1 second
    if (isNaN(numCycles)) {
      console.error(`NaN passed into charityEvent.process(): ${numCycles}`);
    }
    // 1 is the number of cycles we are processing.  1 = 200ms

    // Calculate how many cycles to actually process.

    try {
      //What does a charity event process?  If it's expired or if its been completed.  Check events after processing volunteer actions
      this.cyclesElapsed += numCycles;
      //if (this is in the selectable bucket && this.cyclesElapsed > this.cyclesTillRemoved) this.processRemoval();
    } catch (e: unknown) {
      console.error(`Exception caught when processing Charity Event: ${e}`);
    }
  }

  /** Ends the task and applied the death modifier */
  processDeath(): void {
    //Kill me...  Did not complete in time
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    if (!this.isBeneficial) charityORG.addMessage("Failed: " + this.short_name);
    else charityORG.addMessage("Failed to complete: " + this.short_name);
    //Process death effects and add messages for them
    let deathMsg = "";
    for (const effect of this.deathEffects) {
      switch (effect.type) {
        case DeathEffectTypes.visibility_boost: {
          const visBoostTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.visibilityDrain > 0) {
            if (visBoostTime <= charityORG.visibilityDrain) charityORG.visibilityDrain -= visBoostTime;
            else {
              const remainingTime = visBoostTime - charityORG.visibilityDrain;
              charityORG.visibilityDrain = 0;
              charityORG.visibilityBooster += remainingTime;
              deathMsg += " Vis booster: " + remainingTime;
            }
          } else {
            charityORG.visibilityBooster += visBoostTime;
            deathMsg += " Vis booster: " + visBoostTime;
          }
          break;
        }
        case DeathEffectTypes.visibility_drain: {
          const visDrainTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.visibilityBooster > 0) {
            if (visDrainTime <= charityORG.visibilityBooster) charityORG.visibilityBooster -= visDrainTime;
            else {
              const remainingTime = visDrainTime - charityORG.visibilityBooster;
              charityORG.visibilityBooster = 0;
              charityORG.visibilityDrain += remainingTime;
              deathMsg += " Vis drain: " + remainingTime;
            }
          } else {
            charityORG.visibilityDrain += visDrainTime;
            deathMsg += " Vis drain: " + visDrainTime;
          }
          break;
        }
        case DeathEffectTypes.terror_boost: {
          const terrorBoostTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.terrorDrain > 0) {
            if (terrorBoostTime <= charityORG.terrorDrain) charityORG.terrorDrain -= terrorBoostTime;
            else {
              const remainingTime = terrorBoostTime - charityORG.terrorDrain;
              charityORG.terrorDrain = 0;
              charityORG.terrorBooster += remainingTime;
              deathMsg += " Terror boost: " + remainingTime;
            }
          } else {
            charityORG.terrorBooster += terrorBoostTime;
            deathMsg += " Terror boost: " + terrorBoostTime;
          }
          break;
        }
        case DeathEffectTypes.terror_drain: {
          const terrorDrainTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.terrorBooster > 0) {
            if (terrorDrainTime <= charityORG.terrorBooster) charityORG.terrorBooster -= terrorDrainTime;
            else {
              const remainingTime = terrorDrainTime - charityORG.terrorBooster;
              charityORG.terrorBooster = 0;
              charityORG.terrorDrain += remainingTime;
              deathMsg += " Terror drain: " + remainingTime;
            }
          } else {
            charityORG.terrorDrain += terrorDrainTime;
            deathMsg += " Terror drain: " + terrorDrainTime;
          }
          break;
        }
        case DeathEffectTypes.attack_boost: {
          const atkBoostTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.stopAttacks > 0) {
            if (atkBoostTime <= charityORG.stopAttacks) charityORG.stopAttacks -= atkBoostTime;
            else {
              const remainingTime = atkBoostTime - charityORG.stopAttacks;
              charityORG.stopAttacks = 0;
              charityORG.fastAttacks += remainingTime;
              deathMsg += " Atk boost: " + remainingTime;
            }
          } else {
            charityORG.fastAttacks += atkBoostTime;
            deathMsg += " Atk boost: " + atkBoostTime;
          }
          break;
        }
        case DeathEffectTypes.attack_stop: {
          const atkStopTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.fastAttacks > 0) {
            if (atkStopTime <= charityORG.fastAttacks) charityORG.fastAttacks -= atkStopTime;
            else {
              const remainingTime = atkStopTime - charityORG.fastAttacks;
              charityORG.fastAttacks = 0;
              charityORG.stopAttacks += remainingTime;
              deathMsg += " Atk stop: " + remainingTime;
            }
          } else {
            charityORG.stopAttacks += atkStopTime;
            deathMsg += " Atk stop: " + atkStopTime;
          }
          break;
        }
        case DeathEffectTypes.task_boost: {
          const taskBoostTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.slowTasks > 0) {
            if (taskBoostTime <= charityORG.slowTasks) charityORG.slowTasks -= taskBoostTime;
            else {
              const remainingTime = taskBoostTime - charityORG.slowTasks;
              charityORG.slowTasks = 0;
              charityORG.fastTasks += remainingTime;
              deathMsg += " Task boost: " + remainingTime;
            }
          } else {
            charityORG.fastTasks += taskBoostTime;
            deathMsg += " Task boost: " + taskBoostTime;
          }
          break;
        }
        case DeathEffectTypes.task_drain: {
          const taskDrainTime = Math.floor(effect.strength * 5 * 20 * 10);
          if (charityORG.fastTasks > 0) {
            if (taskDrainTime <= charityORG.fastTasks) charityORG.fastTasks -= taskDrainTime;
            else {
              const remainingTime = taskDrainTime - charityORG.fastTasks;
              charityORG.fastTasks = 0;
              charityORG.slowTasks += remainingTime;
              deathMsg += " Task drain: " + remainingTime;
            }
          } else {
            charityORG.slowTasks += taskDrainTime;
            deathMsg += " Task drain: " + taskDrainTime;
          }
          break;
        }
        case DeathEffectTypes.bank: {
          const bankChange = (Math.abs(charityORG.bank) * effect.strength) / 100;
          charityORG.bank += bankChange;
          deathMsg += " Bank: $" + formatNumber(bankChange);
          break;
        }
        case DeathEffectTypes.karma: {
          const karmaChange = (Player.karma * effect.strength) / 100;
          Player.karma += karmaChange;
          deathMsg += " Karma: " + formatNumber(karmaChange);
          break;
        }
        case DeathEffectTypes.death: {
          const volnum = Math.floor(Math.random() * charityORG.volunteers.length);
          charityORG.volunteers[volnum];
          charityORG.prestige -= charityORG.volunteers[volnum].earnedPrestige;
          charityORG.random += effect.strength;
          //Notify of death
          deathMsg += " Killed: " + charityORG.volunteers[volnum].name;
          charityORG.addMessage("Killed: " + charityORG.volunteers[volnum].name);
          charityORG.volunteers.splice(volnum, 1);
          break;
        }
        case DeathEffectTypes.prestige: {
          const prestigeChange = (charityORG.prestige * effect.strength) / 100;
          for (const vol of charityORG.volunteers) vol.earnedPrestige += prestigeChange / charityORG.volunteers.length;
          charityORG.prestige += prestigeChange;
          deathMsg += " Prestige: " + formatNumber(prestigeChange);
          break;
        }
        case DeathEffectTypes.bonus_time: {
          const bonusTime = Math.floor(effect.strength * 5 * 20 * 10);
          charityORG.storedCycles += bonusTime;
          charityORG.storedCycles = Math.max(0, charityORG.storedCycles);
          deathMsg += " Bonus time: " + bonusTime;
          break;
        }
        case DeathEffectTypes.money: {
          const moneyChange = (effect.strength * Math.abs(Player.money)) / 100;
          moneyChange > 0
            ? Player.gainMoney(moneyChange, "charityORG")
            : Player.loseMoney(moneyChange * -1, "charityORG");
          deathMsg += " Money: $" + formatNumber(moneyChange);
          break;
        }
        case DeathEffectTypes.random_event: {
          const event = new CharityEvent("event", true, false, 10000);
          const style = Math.random() > 0.6666;
          const funding = style ? Math.random() > 0.5 : false;
          event.randomize(style, funding, true);
          style ? charityORG.waitingEvents.push(event) : charityORG.currentEvents.push(event);
          charityORG.random += effect.strength;
          break;
        }
        default:
          break;
      }
    }
    if (deathMsg !== "") charityORG.addItemMessage(deathMsg);
  }
  processCompleted(): void {
    //Complete me!  Completed in time!
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    charityORG.addMessage("Completed: " + this.short_name);
    //Process prize winnings and add messages for them
    if (this.rarity <= 10 || this.prizeLevel <= 10) return;

    const modBase =
      (Math.log10(this.rarity) / 4) * (Math.log10(this.prizeLevel) / 5) * currentNodeMults.CharityORGEventStrength;
    const spins = this.rarity > 9900 ? 5 : this.rarity > 9700 ? 4 : this.rarity > 9500 ? 3 : this.rarity > 9000 ? 2 : 1;

    for (let spin = 0; spin < spins; spin++) {
      const prize = Math.random() * (this.rarity + charityORG.luck);
      const modstr = modBase * (Math.random() * 0.4 + 0.8);
      switch (this.getPrizeValue(prize)) {
        case 0: {
          // Requires Luck Stat to get here.  Lucky Coin and boosted Banner Piece
          charityORG.luckyCoin++;
          this.getRandomBannerPiece(modstr + 0.2);
          charityORG.addItemMessage("Found a lucky coin!");
          break;
        }
        case 1: {
          // Lucky Coin
          charityORG.luckyCoin++;
          charityORG.addItemMessage("Found a lucky coin!");
          break;
        }
        case 2: {
          // Ascension Token
          charityORG.ascensionToken++;
          charityORG.addItemMessage("Found an Ascension Token!");
          break;
        }
        case 3: {
          // Reputation
          // Reputation * modstr / 1000 on all factions
          let msg = "Rep: ";
          for (const faction of Player.factions) {
            const repgain = ((Factions[faction].playerReputation * modstr) / 10) * currentNodeMults.CharityORGSoftcap;
            Factions[faction].playerReputation += repgain;
            msg += " " + Factions[faction].name + " " + formatNumber(repgain);
          }
          charityORG.addItemMessage(msg);
          break;
        }
        case 4: {
          // bonus time
          const bonusTime = Math.floor(modstr * 5 * 20);
          charityORG.storedCycles += bonusTime;
          // Msg about time
          charityORG.addItemMessage("Received " + bonusTime + " in bonus time");
          break;
        }
        case 5: {
          // decoy juice
          charityORG.decoyJuice++;
          charityORG.addItemMessage("Found a Decoy Juice!");
          break;
        }
        case 6: {
          // random dice
          charityORG.randomDice++;
          charityORG.addItemMessage("Found some Random Dice!");
          break;
        }
        case 7: {
          // java juice
          charityORG.javaJuice++;
          charityORG.addItemMessage("Found some Java Juice!");
          break;
        }
        case 8: {
          // money
          const moneyChange = ((modstr * Math.abs(Player.money)) / 100) * currentNodeMults.CharityORGSoftcap;
          moneyChange > 0
            ? Player.gainMoney(moneyChange, "charityORG")
            : Player.loseMoney(moneyChange * -1, "charityORG");
          charityORG.addItemMessage("Money + $" + formatNumber(moneyChange));
          break;
        }
        case 9: {
          // karma
          const karmaChange = ((Player.karma * modstr) / 100) * currentNodeMults.CharityORGSoftcap;
          Player.karma += karmaChange;
          charityORG.addItemMessage("Karma + " + formatNumber(karmaChange));
          break;
        }
        case 10: {
          // prestige
          const prestigeChange = ((charityORG.prestige * modstr) / 100) * currentNodeMults.CharityORGSoftcap;
          for (const vol of charityORG.volunteers) vol.earnedPrestige += prestigeChange / charityORG.volunteers.length;
          charityORG.prestige += prestigeChange;
          charityORG.addItemMessage("Prestige + " + formatNumber(prestigeChange));
          break;
        }
        case 11: {
          // bank
          const bankChange = ((Math.abs(charityORG.bank) * modstr) / 1000) * currentNodeMults.CharityORGSoftcap;
          charityORG.bank += bankChange;
          charityORG.addItemMessage("Bank + $" + formatNumber(bankChange));
          break;
        }
        case 12: {
          // ticket stub
          charityORG.ticketStub++;
          charityORG.addItemMessage("Found a Ticket Stub!");
          break;
        }
        case 13: {
          // banner pieces
          this.getRandomBannerPiece(modstr);
          break;
        }
        default:
          break;
      } // End of switch
    } // End of spins
  }
  getPrizeValue(prize: number): number {
    if (prize > 10000) return 0;
    else if (prize > 9500) return 1;
    else if (prize > 9000) return 2;
    else if (prize > 8600) return 3;
    else if (prize > 8100) return 4;
    else if (prize > 7800) return 5;
    else if (prize > 7500) return 6;
    else if (prize > 7200) return 7;
    else if (prize > 6900) return 8;
    else if (prize > 6600) return 9;
    else if (prize > 6300) return 10;
    else if (prize > 6000) return 11;
    else if (prize > 4000) return 12;
    else return 13;
  }
  processRemoval(): void {
    //Remove me :(  Not selected and will be removed.  Will likely stay empty
  }
  randomize(isBeneficial: boolean, fundraising = false, random = false): void {
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    //Randomize all values for a new, random effect
    this.cyclesCompleted = 0;
    this.cyclesElapsed = 0;

    if (fundraising) {
      this.isBeneficial = true;
      this.hasTimer = true;
      this.rarity = Math.floor(Math.random() * 5000 + 5000);
      this.rarity = random ? Math.min(10000, this.rarity + 1000) : this.rarity;
      this.prizeLevel = random
        ? Math.max((Math.random() * 0.2 + 0.8) * this.getHighestDifficulty(), 0.2)
        : Math.max(Math.random() * this.getHighestDifficulty(), 0.2); //Get the highest difficulty that can be completed by any volunteer right now and use that as the modifer.
      this.cyclesNeeded = Math.floor(
        ((5 * 60 * 1 * (Math.log10(10001 - this.rarity) / 2 + 0.05) * charityORG.volunteers.length) /
          (CharityORGConstants.MaximumCharityMembers - 3)) *
          4,
      ); // Needed to finish task.  Higher rarity should be harder.  Attacks should be harder
      this.cyclesNeeded = random ? Math.floor((Math.random() * 0.4 + 0.8) * this.cyclesNeeded) : this.cyclesNeeded;
      this.cyclesTillDeath = Math.floor(
        5 *
          60 *
          1 *
          (Math.log10(10001 - this.rarity) / 2 + 0.05) *
          ((charityORG.volunteers.length / (CharityORGConstants.MaximumCharityMembers - 3)) * 2.5) *
          4,
      ); // Until it's considered failed.  Higher rarity should be higher
      this.cyclesTillDeath = random
        ? Math.floor((Math.random() * 0.4 + 0.8) * this.cyclesTillDeath)
        : this.cyclesTillDeath;
      this.cyclesTillRemoved = Math.floor(5 * 60 * 1 * (Math.log10(10001 - this.rarity) / 2 + 0.05)); // Until it's removed from the list of available.  Lower rarity should be higher
      this.cyclesTillRemoved = random
        ? Math.floor((Math.random() * 0.4 + 0.8) * this.cyclesTillRemoved)
        : this.cyclesTillRemoved;
    } else {
      this.isBeneficial = isBeneficial;
      this.hasTimer = this.isBeneficial ? true : Math.random() > 0.5;
      this.rarity = Math.floor(Math.random() * 10000);
      this.rarity = random ? Math.min(10000, this.rarity + 1000) : this.rarity + 1;
      this.prizeLevel = Math.max(Math.random() * this.getHighestDifficulty(), 0.2); //Get the highest difficulty that can be completed by any volunteer right now and use that as the modifer.
      this.cyclesNeeded =
        (5 * 60 * 1 * (Math.log10(10001 - this.rarity) / 2 + 0.05) * charityORG.volunteers.length) /
        (CharityORGConstants.MaximumCharityMembers - 3); // Needed to finish task.  Higher rarity should be harder.  Attacks should be harder
      if (!this.isBeneficial) this.cyclesNeeded *= 1.45; // Harder if it's an attack
      if (!this.isBeneficial && !this.hasTimer) this.cyclesNeeded *= (Math.log10(this.rarity) / 2 + 4) / 4; // Even harder to get rid of if it's persistent
      this.cyclesNeeded *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.cyclesNeeded = Math.floor(this.cyclesNeeded);
      this.cyclesTillDeath = Math.floor(
        5 *
          60 *
          1 *
          (Math.log10(10001 - this.rarity) / 2 + 0.05) *
          ((charityORG.volunteers.length / (CharityORGConstants.MaximumCharityMembers - 3)) * 2.5),
      ); // Until it's considered failed.  Higher rarity should be higher
      this.cyclesTillDeath *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.cyclesTillDeath = Math.floor(this.cyclesTillDeath);
      this.cyclesTillRemoved = Math.floor(5 * 60 * 1 * (Math.log10(10001 - this.rarity) / 2 + 0.05)); // Until it's removed from the list of available.  Lower rarity should be higher
      this.cyclesTillRemoved *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.cyclesTillRemoved = Math.floor(this.cyclesTillRemoved);
    }

    this.randomizeDesc(fundraising);
    this.randomizeTask(fundraising, random);
    this.randomizeModifiers(fundraising, random);
    this.randomizeDeathEffects(fundraising, random);
  }
  randomizeTask(fundraising: boolean, random: boolean): void {
    // Recreate the task object base values.
    const dif = this.prizeLevel;
    this.taskObject.difficulty = dif;

    //Get the best values, and randomize them a bit.
    //this.taskObject.baseMoneySpend = dif * 8 * ((Math.random() * .4) + .8);
    if (fundraising !== undefined && fundraising) {
      this.taskObject.baseMoneyGain = dif * 7000000 * (Math.random() * 0.2 + 0.95);
      this.taskObject.baseMoneyGain *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.basePrestige = dif * 0.01125 * (Math.random() * 0.4 + 0.8);
      this.taskObject.basePrestige *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.isSpending = false;
    } else {
      this.taskObject.baseMoneySpend = dif * 7000000 * (Math.random() * 0.4 + 0.8);
      this.taskObject.baseMoneySpend *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.baseVisibility = dif * 0.00000014056 * (Math.random() * 0.2 + 0.9);
      this.taskObject.baseVisibility *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.basePrestige = dif * 0.01125 * (Math.random() * 0.4 + 0.8);
      this.taskObject.basePrestige *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.baseKarmaGain = dif * 0.0000000001875 * (Math.random() * 0.2 + 0.9);
      this.taskObject.baseKarmaGain *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.baseTerror = dif * 0.00000014056 * (Math.random() * 0.2 + 0.9);
      this.taskObject.baseTerror *= random ? Math.random() * 0.4 + 0.8 : 1;
      this.taskObject.isSpending = true;
    }

    const hackweight = Math.random() * 4;
    const strweight = Math.random() * 4;
    const defweight = Math.random() * 4;
    const dexweight = Math.random() * 4;
    const agiweight = Math.random() * 4;
    const chaweight = Math.random() * 4;
    const mult = 100 / (hackweight + strweight + defweight + dexweight + agiweight + chaweight);
    this.taskObject.hackWeight = hackweight * mult;
    this.taskObject.strWeight = strweight * mult;
    this.taskObject.defWeight = defweight * mult;
    this.taskObject.dexWeight = dexweight * mult;
    this.taskObject.agiWeight = agiweight * mult;
    this.taskObject.chaWeight = chaweight * mult;
  }
  randomizeDesc(fundraising: boolean): void {
    const num = this.count();

    if (fundraising !== undefined && fundraising) {
      const goodname = goodentities[Math.floor(Math.random() * goodentities.length)];
      const goodact = fundacts[Math.floor(Math.random() * fundacts.length)];
      this.name = goodname + " " + goodact + " - " + num;
      this.short_name = goodname + " " + goodact;
      this.taskObject.name = this.name;
      this.taskObject.short_name = this.short_name;
      this.desc = this.short_name;
      this.taskObject.desc = this.desc;
    } else {
      switch (this.isBeneficial) {
        case true: {
          const goodname =
            Math.random() > 0.5
              ? boysnames[Math.floor(Math.random() * boysnames.length)]
              : girlsnames[Math.floor(Math.random() * girlsnames.length)];
          const goodhword = helpwords[Math.floor(Math.random() * helpwords.length)];
          const goodact = activity[Math.floor(Math.random() * activity.length)];
          this.name = goodhword + " " + goodname + " - " + num;
          this.short_name = goodhword + " " + goodname;
          this.taskObject.name = this.name;
          this.taskObject.short_name = this.short_name;
          this.desc = goodhword + " " + goodname + " " + goodact;
          this.taskObject.desc = this.desc;
          break;
        }
        case false: {
          const badname = evilentities[Math.floor(Math.random() * evilentities.length)];
          const badhword = hurtwords[Math.floor(Math.random() * hurtwords.length)];
          this.name = badhword + " " + badname + " - " + num;
          this.short_name = badhword + " " + badname;
          this.taskObject.name = this.name;
          this.taskObject.short_name = this.short_name;
          this.desc = this.short_name;
          this.taskObject.desc = this.desc;
          break;
        }
        default:
          //Unknown
          break;
      }
    }
    // Recreate the descrption, name, short descript, long desript, task name, task desc
  }
  randomizeModifiers(fundraising: boolean, random: boolean): void {
    // Recreate the modifiers based on current stats
    if (this.rarity <= 10 || this.prizeLevel <= 10) return;
    const fundmod = fundraising !== undefined && fundraising ? 0.1 : 1; // No mods for these.  Would be too strong.

    const entries = Object.values(ModifyAreas);
    if (!this.isBeneficial) {
      for (let i = 0; i < Math.log10(this.rarity) + Math.log10(this.prizeLevel) - 2; i++) {
        const rndmod = random ? Math.random() * 0.4 + 0.8 : 1;
        const modArea = ModifyAreas[entries[Math.floor(Math.random() * entries.length)]];
        let modStr =
          ((((-0.5 * Math.log10(this.rarity)) / 4) * Math.log10(this.prizeLevel)) / 5) *
          (Math.random() * 0.4 + 0.8) *
          rndmod;
        let found = false;
        if (modArea.includes(ModifyAreas.terror_gain) || modArea.includes(ModifyAreas.money_spend)) modStr *= -1;
        if (modArea.includes(ModifyAreas.money_gain) || modArea.includes(ModifyAreas.money_spend)) modStr *= 0.5;
        for (const currentmod of this.modifiers) {
          if (currentmod.area === modArea) {
            currentmod.strength += modStr;
            found = true;
            break;
          }
        }
        if (!found && modStr !== 0) this.modifiers.push(new Modifier(modArea, modStr));
      }
    } else {
      for (let i = 0; i < Math.log10(this.rarity) + Math.log10(this.prizeLevel) - 2; i++) {
        const rndmod = random ? Math.random() * 0.4 + 0.8 : 1;
        const modArea = ModifyAreas[entries[Math.floor(Math.random() * entries.length)]];
        let modStr =
          0.25 *
          Math.log10(this.rarity) *
          (Math.log10(this.prizeLevel) / 2) *
          (Math.random() * 0.4 + 0.8) *
          fundmod *
          rndmod;
        let found = false;
        if (modArea.includes(ModifyAreas.terror_gain) || modArea.includes(ModifyAreas.money_spend)) modStr *= -1;
        if (modArea.includes(ModifyAreas.money_gain) || modArea.includes(ModifyAreas.money_spend)) modStr *= 0.5;
        for (const currentmod of this.modifiers) {
          if (currentmod.area === modArea) {
            currentmod.strength += modStr;
            found = true;
            break;
          }
        }
        if (!found && modStr !== 0) this.modifiers.push(new Modifier(modArea, modStr));
      }
    }
  }
  randomizeDeathEffects(fundraising: boolean, random: boolean): void {
    // Recreate death effects
    if (this.taskObject.difficulty <= 10 || this.rarity <= 10) return;
    const entries = Object.values(DeathEffectTypes);

    if (fundraising) {
      //(fundraising) {
      const rndmod = random ? Math.random() * 0.4 + 0.8 : 1;
      const mod = new DeathEffect(
        DeathEffectTypes.random_event,
        ((Math.log10(this.prizeLevel) * 2) / 3) *
          (((Math.log10(this.rarity) / 4) * 2) / 3) *
          (Math.random() * 0.4 + 0.8) *
          rndmod,
      );
      this.deathEffects.push(mod);
    }

    const baseModifyer = Math.log10(this.rarity) / 4;
    for (let i = 0; i < ((Math.log10(this.rarity) + Math.log10(this.prizeLevel) - 2) * 2) / 3; i++) {
      const rndmod = random ? Math.random() * 0.4 + 0.8 : 1;
      const modtype = DeathEffectTypes[entries[Math.floor(Math.random() * entries.length)]];
      const modcase = Math.random() > 0.5 ? 1 : -1;
      let modstr =
        ((baseModifyer * (Math.log10(this.prizeLevel) / 5) * (Math.random() * 0.4 + 0.8)) / 3) *
        rndmod *
        currentNodeMults.CharityORGEventStrength;
      if (modtype === DeathEffectTypes.death && this.isBeneficial) {
        i--;
        continue;
      }
      if (
        modtype === DeathEffectTypes.bank ||
        modtype === DeathEffectTypes.karma ||
        modtype === DeathEffectTypes.money ||
        modtype === DeathEffectTypes.prestige ||
        modtype === DeathEffectTypes.bonus_time
      )
        modstr *= modcase;
      let found = false;
      let duplicate = false;
      for (const currentmod of this.deathEffects) {
        if (currentmod.type === modtype) {
          currentmod.strength += modstr;
          found = true;
          break;
        } //We have an opposing effect.
        else if (
          (modtype === DeathEffectTypes.attack_boost && currentmod.type === DeathEffectTypes.attack_stop) ||
          (modtype === DeathEffectTypes.attack_stop && currentmod.type === DeathEffectTypes.attack_boost) ||
          (modtype === DeathEffectTypes.task_boost && currentmod.type === DeathEffectTypes.task_drain) ||
          (modtype === DeathEffectTypes.task_drain && currentmod.type === DeathEffectTypes.task_boost) ||
          (modtype === DeathEffectTypes.terror_boost && currentmod.type === DeathEffectTypes.terror_drain) ||
          (modtype === DeathEffectTypes.terror_drain && currentmod.type === DeathEffectTypes.terror_boost) ||
          (modtype === DeathEffectTypes.visibility_boost && currentmod.type === DeathEffectTypes.visibility_drain) ||
          (modtype === DeathEffectTypes.visibility_drain && currentmod.type === DeathEffectTypes.visibility_boost)
        ) {
          i--;
          duplicate = true;
          break;
        }
      }

      if (!found && !duplicate && modstr !== 0) this.deathEffects.push(new DeathEffect(modtype, modstr));
    }
  }
  processWork(numCycles: number): void {
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    const workMod = charityORG.fastTasks > 0 ? 1.1 : charityORG.slowTasks ? 0.9 : 1;
    this.cyclesCompleted += numCycles * workMod;
  }
  getHighestDifficulty(): number {
    let dif = 0;
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    for (const volunteer of charityORG.volunteers) {
      const ave = (volunteer.agi + volunteer.cha + volunteer.def + volunteer.dex + volunteer.hack + volunteer.str) / 6;
      if (ave / 5.1 > dif) {
        dif = ave / 5.1;
      }
    }
    return dif;
  }
  count(): number {
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    charityORG.counter++;
    if (charityORG.counter >= Number.MAX_SAFE_INTEGER - 10) charityORG.counter = 0;
    return charityORG.counter;
  }
  bannerCount(): number {
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    charityORG.bannerCounter++;
    if (charityORG.bannerCounter >= 1000000) charityORG.bannerCounter = 10000;
    return charityORG.bannerCounter;
  }
  getRandomID(length: number): string {
    const valid = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
    ];
    let id = "";
    for (let i = 0; i < length; i++) id += valid[Math.floor(Math.random() * valid.length)];
    return id;
  }
  addBannerEffect(BannerPiece: BannerPiece, Area: AugmentationAreas, Str: number, TotalStr: number): void {
    let found = false;
    for (const piece of BannerPiece.effects) {
      if (Area === piece.effect) {
        found = true;
        piece.strength += Str;
        break;
      }
    }
    if (!found) BannerPiece.effects.push(new BannerFragment(Area, Str));
    BannerPiece.totalPower += TotalStr;
  }
  getRandomBannerPiece(str: number): void {
    const charityORG = (function () {
      if (Player.charityORG === null) throw new Error("Charity should not be null");
      return Player.charityORG;
    })();
    if (charityORG.bannerPiecesStore.length >= CharityORGConstants.CharityMaxBannerPieces) {
      charityORG.addItemMessage("Gave up a Banner Piece");
      return;
    }
    //str /= 2; May need to tone it down now that I'm doubling the effect, may want to halve the str.
    const bannerNum = this.bannerCount();
    const basicTypes = ["Basic", "Pebbles", "Strong", "Assorted", "Aggressive"];
    const premTypes = ["TheOne", "TroiAmis", "DoubleHelix", "Clover"];
    const augareas = Object.values(AugmentationAreas);
    const type =
      Math.random() > 0.9
        ? premTypes[Math.floor(Math.random() * premTypes.length)]
        : basicTypes[Math.floor(Math.random() * basicTypes.length)];
    const bannerPiece = new BannerPiece(type + ":" + bannerNum + this.getRandomID(5), type + ":" + bannerNum);
    switch (
      type // All basic types add up to 2x str.
    ) {
      case "Basic": {
        const t1BasicEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
        const t1BasicStr = this.getBannerStr(str, t1BasicEffect);
        this.addBannerEffect(bannerPiece, t1BasicEffect, t1BasicStr, str);
        for (let i = 0; i < 3; i++) {
          const t2BasicEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t2BasicStr = this.getBannerStr(str / 3, t2BasicEffect);
          this.addBannerEffect(bannerPiece, t2BasicEffect, t2BasicStr, str / 3);
        }
        break;
      }
      case "Pebbles": {
        for (let i = 0; i < 20; i++) {
          const t2PebblesEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t2PebblesStr = this.getBannerStr(str / 10, t2PebblesEffect);
          this.addBannerEffect(bannerPiece, t2PebblesEffect, t2PebblesStr, str / 10);
        }
        break;
      }
      case "Strong": {
        const t1StrongEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
        const t1StrongStr = this.getBannerStr(str * 1.5, t1StrongEffect);
        this.addBannerEffect(bannerPiece, t1StrongEffect, t1StrongStr, str * 1.5);
        for (let i = 0; i < 2; i++) {
          const t2StrongEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t2StrongStr = this.getBannerStr(str / 4, t2StrongEffect);
          this.addBannerEffect(bannerPiece, t2StrongEffect, t2StrongStr, str / 4);
        }
        break;
      }
      case "Assorted": {
        for (let i = 0; i < 10; i++) {
          const t2AssortedEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t2AssortedStr = this.getBannerStr(str / 5, t2AssortedEffect);
          this.addBannerEffect(bannerPiece, t2AssortedEffect, t2AssortedStr, str / 5);
        }
        break;
      }
      case "Aggressive": {
        for (let i = 0; i < 2; i++) {
          const t2AggressiveEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t2AggressiveStr = this.getBannerStr(str, t2AggressiveEffect);
          this.addBannerEffect(bannerPiece, t2AggressiveEffect, t2AggressiveStr, str);
        }
        break;
      }
      case "TheOne": {
        // All prem types are up to 3x str
        const t1TheOneEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
        const t1TheOneStr = this.getBannerStr(str * 3, t1TheOneEffect);
        this.addBannerEffect(bannerPiece, t1TheOneEffect, t1TheOneStr, str * 3);
        break;
      }
      case "TroiAmis": {
        for (let i = 0; i < 3; i++) {
          const t2TroiAmisEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t2TroiAmisStr = this.getBannerStr(str, t2TroiAmisEffect);
          this.addBannerEffect(bannerPiece, t2TroiAmisEffect, t2TroiAmisStr, str);
        }
        break;
      }
      case "DoubleHelix": {
        for (let i = 0; i < 2; i++) {
          const t1DoubleHelixEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t1DoubleHelixStr = this.getBannerStr(str * 1.5, t1DoubleHelixEffect);
          this.addBannerEffect(bannerPiece, t1DoubleHelixEffect, t1DoubleHelixStr, str * 1.5);
        }
        break;
      }
      case "Clover": {
        for (let i = 0; i < 4; i++) {
          const t1CloverEffect = augareas[Math.floor(Math.random() * Object.values(AugmentationAreas).length)];
          const t1CloverStr = this.getBannerStr((str * 3) / 4, t1CloverEffect);
          this.addBannerEffect(bannerPiece, t1CloverEffect, t1CloverStr, (str * 3) / 4);
        }
        break;
      }
      default:
        return;
    }
    //["TheOne", "TroiAmis", "DoubleHelix", "Clover"];
    bannerPiece.short_name = type + ":" + formatNumber(bannerPiece.totalPower);
    charityORG.bannerPiecesStore.push(bannerPiece);
    charityORG.addItemMessage("Found a Banner Piece: " + bannerPiece.short_name);
  }
  getBannerStr(str: number, eff: AugmentationAreas): number {
    const fuzzy = Math.random() * 0.1 + 0.95;
    str /= 100;
    switch (eff) {
      case AugmentationAreas.lucky:
        return str * 7500 * fuzzy;
      case AugmentationAreas.hacking:
      case AugmentationAreas.strength:
      case AugmentationAreas.defense:
      case AugmentationAreas.dexterity:
      case AugmentationAreas.agility:
      case AugmentationAreas.charisma:
        return str * 1.5 * fuzzy;
      case AugmentationAreas.hacking_exp:
      case AugmentationAreas.strength_exp:
      case AugmentationAreas.defense_exp:
      case AugmentationAreas.dexterity_exp:
      case AugmentationAreas.agility_exp:
      case AugmentationAreas.charisma_exp:
        return str * 10 * fuzzy;
      case AugmentationAreas.hacking_chance:
      case AugmentationAreas.hacking_speed:
      case AugmentationAreas.hacking_money:
      case AugmentationAreas.hacking_grow:
        return str * fuzzy;
      case AugmentationAreas.company_rep:
      case AugmentationAreas.faction_rep:
        return str * 10 * fuzzy;
      case AugmentationAreas.crime_money:
      case AugmentationAreas.work_money:
      case AugmentationAreas.charity_money:
        return str * 10 * fuzzy;
      case AugmentationAreas.crime_success:
      case AugmentationAreas.charity_success:
        return str * 5 * fuzzy;
      case AugmentationAreas.hacknet_node_money:
        return str * 10 * fuzzy;
      case AugmentationAreas.hacknet_node_purchase_cost:
      case AugmentationAreas.hacknet_node_ram_cost:
      case AugmentationAreas.hacknet_node_core_cost:
      case AugmentationAreas.hacknet_node_level_cost:
        return str * -1.5 * fuzzy;
      case AugmentationAreas.bladeburner_max_stamina:
      case AugmentationAreas.bladeburner_stamina_gain:
      case AugmentationAreas.bladeburner_analysis:
        return str * 10 * fuzzy;
      case AugmentationAreas.bladeburner_success_chance:
        return str * fuzzy;
      default:
        return str * fuzzy;
    }
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("CharityEvent", this);
  }

  /** Initializes a CharityORG object from a JSON save state. */
  static fromJSON(value: IReviverValue): CharityEvent {
    return Generic_fromJSON(CharityEvent, value.data);
  }
}
constructorsForReviver.CharityEvent = CharityEvent;

const boysnames = [
  "Adam",
  "Aaron",
  "Alex",
  "Antony",
  "Aiden",
  "Adrian",
  "Benjamin",
  "Bennett",
  "Brayden",
  "Brett",
  "Bryon",
  "Carl",
  "Charles",
  "Carter",
  "Christopher",
  "Caleb",
  "Colton",
  "David",
  "Donald",
  "Dexter",
  "Derik",
  "Edward",
  "Elon",
  "Eggbert",
  "Eric",
  "Francis",
  "Falcon",
  "Filbert",
  "Franky",
  "Fulton",
  "Fitzroy",
  "George",
  "Gerald",
  "Greg",
  "Gordon",
  "Garry",
  "Gumble",
  "Harry",
  "Hank",
  "Henry",
  "Hubert",
  "Howard",
  "Isaic",
  "Irvin",
  "Izzy",
  "Justin",
  "Julius",
  "Joules",
  "Javier",
  "Jacobs",
  "Kelly",
  "Kyle",
  "Kevin",
  "Kurtis",
  "Klyde",
  "Lenoard",
  "Leroy",
  "Lemon",
  "Lennon",
  "Lloyd",
  "Larry",
  "Michael",
  "Martin",
  "Mitchel",
  "Moss",
  "Marvin",
  "Norman",
  "Nathan",
  "Nate",
  "Nale",
  "Nash",
  "Norbert",
  "Oscar",
  "Oliver",
  "Oxford",
  "Olof",
  "Peter",
  "Paul",
  "Paxton",
  "Phillip",
  "Pan",
  "Philbert",
  "Quillian",
  "Quilbert",
  "Qbert",
  "Robbert",
  "Richard",
  "Rocky",
  "Ralf",
  "Robby",
  "Randy",
  "Simon",
  "Sal",
  "Serral",
  "Steven",
  "Scott",
  "Skip",
  "Theodor",
  "Trevor",
  "Tanner",
  "Trevor",
  "Tiger",
  "Ulfric",
  "Urnest",
  "Ulric",
  "Umar",
  "Victor",
  "Vladimir",
  "Vincent",
  "Vance",
  "Valentino",
  "Van",
  "Vito",
  "William",
  "Walker",
  "Wade",
  "Weston",
  "Walter",
  "Wayne",
  "Warren",
  "Wesley",
  "Xavier",
  "Xander",
  "Xerxes",
  "Xeno",
  "Yves",
  "Yasir",
  "Yael",
  "Zachary",
  "Zane",
  "Zeke",
];

const girlsnames = [
  "Amelia",
  "Amanda",
  "Angela",
  "Angel",
  "Akasha",
  "Anne",
  "Beverly",
  "Betty",
  "Betsy",
  "Barbara",
  "Baily",
  "Camila",
  "Candace",
  "Carry",
  "Cristy",
  "Cristine",
  "Destiny",
  "Debora",
  "Dakota",
  "Daisy",
  "Dee",
  "Deena",
  "Emily",
  "Erika",
  "Erin",
  "Evilyn",
  "Esha",
  "Echo",
  "Fiona",
  "Faith",
  "Flora",
  "Francesca",
  "Florence",
  "Gertrude",
  "Gabrielle",
  "Grace",
  "Giselle",
  "Genevieve",
  "Helen",
  "Haily",
  "Hazel",
  "Hannah",
  "Haven",
  "Isabele",
  "Ivy",
  "Irene",
  "Iris",
  "Ivory",
  " Ilana",
  "Jasmine",
  "Jade",
  "Josephine",
  "Juliana",
  "Julia",
  "Jasmine",
  "Joy",
  "Kristine",
  "Kali",
  "Katherine",
  "Kinsley",
  "Kimberly",
  "Kayla",
  "Loretta",
  "Laya",
  "Lydia",
  "Lucy",
  "Lilly",
  "Lana",
  "Layla",
  "Molly",
  "Madeline",
  "Madison",
  "Margaret",
  "Mabel",
  "Mila",
  "Nancy",
  "Naomi",
  "Natalie",
  "Nora",
  "Nadia",
  "Nina",
  "Natasha",
  "Ophellia",
  "Ocean",
  "Odelia",
  "Odette",
  "Olivia",
  "Olive",
  "Patricia",
  "Penelope",
  "Piper",
  "Phoebe",
  "Paige",
  "Payton",
  "Q",
  "Quinn",
  "Quenby",
  "Quay",
  "Rosa",
  "Rachel",
  "Rebecca",
  "Rose",
  "Riley",
  "Rhea",
  "Rosalind",
  "River",
  "Sage",
  "Sophia",
  "Savannah",
  "Stella",
  "Sabrina",
  "Sandra",
  "Scarlett",
  "Samantha",
  "Tiffany",
  "Tatiana",
  "Tala",
  "Tessa",
  "Theresa",
  "Tamara",
  "Thea",
  "Tiffany",
  "Ursula",
  "Umbrielle",
  "Uma",
  "Ula",
  "Undine",
  "Victoria",
  "Violet",
  "Valerie",
  "Vanessa",
  "Viola",
  "Veronica",
  "Vivian",
  "Winona",
  "Wendy",
  "Wilma",
  "Whitney",
  "Willow",
  "Wanda",
  "Winter",
  "Winola",
  "Winifred",
  "Xena",
  "Xandra",
  "Xia",
  "Xara",
  "Yvette",
  "Yvonne",
  "Yasmina",
  "Yasmin",
  "Zelena",
  "Zara",
  "Zoey",
  "Zariah",
];

const helpwords = [
  "Assist with",
  "Intervene with",
  "Help",
  "Fulfill a wish for",
  "Complete a wish for",
  "Help with",
  "Assist",
  "Aid",
  "Persuade",
  "Encourage",
  "Allow",
  "Facilitate",
  "Support",
  "Pave the way for",
  "Allow for",
  "Fulfill the desire of",
  "Fulfill the last wish of",
];

const activity = [
  "in getting to Sector-12 funland",
  "to find their puppy",
  "to go rock climbing",
  "to go swimming in a lake",
  "to treat their cancer",
  "to treat their heart disearse",
  "to treat their leukemia",
  "to get a service dog",
  "to go to space",
  "to finish school",
  "to meet their favorite star",
  "to get a puppy",
  "to get a kitty",
  "to ride a horse",
  "to view an iMax movie",
  "to own a home",
];

const hurtwords = [
  "Defend against",
  "Defend from",
  "Fend off",
  "Fend away",
  "Swat away",
  "Get assistance with",
  "Being attacked by",
  "Assaulted by",
  "Attacked by",
  "Assailed by",
  "Stop",
  "Route",
  "Finish off",
  "Massive assault from",
  "Indiscriminate attack from",
  "Blindsided by",
  "Taken advantage of by",
  "Double crossed by",
  "Being robbed by",
];

const evilentities = [
  "Megacorp",
  "Ecorp",
  "NiteSec",
  "The Black Hand",
  "BitRunners",
  "Slum Snakes",
  "Tetrads",
  "Silhouette",
  "Speakers for the Dead",
  "The Dark Army",
  "The Syndicate",
  "Dr. Porkchop",
  "Mr. Misty Eyes",
  "The Ripper",
  "Shredder",
  "Don Julio",
  "The Mask",
  "APT-28",
  "El Despico",
  "X",
  "Ali the Alliterator",
];

const goodentities = [
  "The Covenant",
  "Daedalus",
  "Illuminati",
  "Sector-12",
  "Chongquin",
  "New Tokyo",
  "Ishima",
  "Aevum",
  "Volhaven",
  "Blade Industries",
  "Four Sigma",
  "KuaiGong International",
  "NWO",
  "OmniTek Incorporated",
  "Bachman & Associates",
  "Clarke Incorporated",
  "Fulcrum",
];

const fundacts =
  // Entities name goes in front
  [
    "talent show",
    "fundraiser",
    "special event",
    "special gala event",
    "covert activity",
    "has a job - no questions asked...",
    "requires assistance",
    "requests assistance",
    "needs your help!",
    "is requesting assistance",
    "is requesting aid",
    "needs help",
    "has a job for you",
    "has work for you",
    "has a proposition for you",
    "would like to help you",
    "is willing to give you aid",
    "would like your help",
    "needs your help",
    "is asking for your assistance",
    "has a fundraising event for you",
    "has something special for you",
    "would like your assistance",
    "has a problem...",
    "needs protection",
    "will pay you well for this",
    "is on a spending spree!",
  ];
