import { Player } from "@player";
import { AugmentationName, FactionName } from "@enums";
import { Fragment } from "./Fragment";
import { ActiveFragment } from "./ActiveFragment";
import { FragmentType } from "./FragmentType";
import { BaseGift } from "./BaseGift";
import { Factions } from "../Faction/Factions";
import { CalculateEffect } from "./formulas/effect";
import { StaneksGiftEvents } from "./StaneksGiftEvents";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { StanekConstants } from "./data/Constants";
import { BitNodeMultipliers } from "../BitNode/BitNodeMultipliers";
import { defaultMultipliers, mergeMultipliers, Multipliers, scaleMultipliers } from "../PersonObjects/Multipliers";
import { StaticAugmentations } from "../Augmentation/StaticAugmentations";
import { getKeyList } from "../utils/helpers/getKeyList";

export class StaneksGift extends BaseGift {
  isBonusCharging = false;
  justCharged = true;
  storedCycles = 0;
  constructor() {
    super();
  }

  baseSize(): number {
    return StanekConstants.BaseSize + BitNodeMultipliers.StaneksGiftExtraSize + Player.sourceFileLvl(13);
  }

  width(): number {
    return Math.max(2, Math.min(Math.floor(this.baseSize() / 2 + 1), StanekConstants.MaxSize));
  }
  height(): number {
    return Math.max(3, Math.min(Math.floor(this.baseSize() / 2 + 0.6), StanekConstants.MaxSize));
  }

  charge(af: ActiveFragment, threads: number): void {
    if (threads > af.highestCharge) {
      af.numCharge = (af.highestCharge * af.numCharge) / threads + 1;
      af.highestCharge = threads;
    } else {
      af.numCharge += threads / af.highestCharge;
    }

    const cotmg = Factions[FactionName.ChurchOfTheMachineGod];
    cotmg.playerReputation += (Player.mults.faction_rep * (Math.pow(threads, 0.95) * (cotmg.favor + 100))) / 1000;
    this.justCharged = true;
  }

  inBonus(): boolean {
    return this.storedCycles >= 5;
  }

  process(numCycles = 1): void {
    if (!Player.hasAugmentation(AugmentationName.StaneksGift1)) return;
    this.storedCycles += numCycles;
    const usedCycles = this.isBonusCharging ? 5 : 1;
    this.isBonusCharging = false;
    this.storedCycles = Math.max(0, this.storedCycles - usedCycles);
    // Only update multipliers (slow) if there was charging done since last process tick.
    if (this.justCharged) {
      this.updateMults();
      this.justCharged = false;
    }
    StaneksGiftEvents.emit();
  }

  effect(fragment: ActiveFragment): number {
    // Find all the neighboring cells
    const cells = fragment.neighbors();
    // find the neighboring active fragments.
    const maybeFragments = cells.map((n) => this.fragmentAt(n[0], n[1]));

    // Filter out undefined with typescript "Type guard". Whatever
    let neighbors = maybeFragments.filter((v: ActiveFragment | undefined): v is ActiveFragment => !!v);

    neighbors = neighbors.filter((fragment) => fragment.fragment().type === FragmentType.Booster);
    let boost = 1;

    neighbors = neighbors.filter((v, i, s) => s.indexOf(v) === i);
    for (const neighboor of neighbors) {
      boost *= neighboor.fragment().power;
    }
    return CalculateEffect(fragment.highestCharge, fragment.numCharge, fragment.fragment().power, boost);
  }

  canPlace(rootX: number, rootY: number, rotation: number, fragment: Fragment): boolean {
    if (rootX < 0 || rootY < 0) return false;
    if (rootX + fragment.width(rotation) > this.width()) return false;
    if (rootY + fragment.height(rotation) > this.height()) return false;
    if (this.count(fragment) >= fragment.limit) return false;
    const newFrag = new ActiveFragment({ x: rootX, y: rootY, rotation: rotation, fragment: fragment });
    for (const aFrag of this.fragments) {
      if (aFrag.collide(newFrag)) return false;
    }
    return true;
  }

  place(rootX: number, rootY: number, rotation: number, fragment: Fragment): boolean {
    if (!this.canPlace(rootX, rootY, rotation, fragment)) return false;
    this.fragments.push(new ActiveFragment({ x: rootX, y: rootY, rotation: rotation, fragment: fragment }));
    return true;
  }

  findFragment(rootX: number, rootY: number): ActiveFragment | undefined {
    return this.fragments.find((f) => f.x === rootX && f.y === rootY);
  }

  count(fragment: Fragment): number {
    let amt = 0;
    for (const aFrag of this.fragments) {
      if (aFrag.fragment().id === fragment.id) amt++;
    }
    return amt;
  }

  delete(rootX: number, rootY: number): boolean {
    for (let i = 0; i < this.fragments.length; i++) {
      if (this.fragments[i].x === rootX && this.fragments[i].y === rootY) {
        this.fragments.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  clear(): void {
    this.fragments = [];
  }

  clearCharge(): void {
    this.fragments.forEach((f) => {
      f.highestCharge = 0;
      f.numCharge = 0;
    });
  }

  calculateMults(): Multipliers {
    const mults = defaultMultipliers();
    for (const aFrag of this.fragments) {
      const fragment = aFrag.fragment();

      const power = this.effect(aFrag);
      switch (fragment.type) {
        case FragmentType.HackingChance:
          mults.hacking_chance *= power;
          break;
        case FragmentType.HackingSpeed:
          mults.hacking_speed *= power;
          break;
        case FragmentType.HackingMoney:
          mults.hacking_money *= power;
          break;
        case FragmentType.HackingGrow:
          mults.hacking_grow *= power;
          break;
        case FragmentType.Hacking:
          mults.hacking *= power;
          mults.hacking_exp *= power;
          break;
        case FragmentType.Strength:
          mults.strength *= power;
          mults.strength_exp *= power;
          break;
        case FragmentType.Defense:
          mults.defense *= power;
          mults.defense_exp *= power;
          break;
        case FragmentType.Dexterity:
          mults.dexterity *= power;
          mults.dexterity_exp *= power;
          break;
        case FragmentType.Agility:
          mults.agility *= power;
          mults.agility_exp *= power;
          break;
        case FragmentType.Charisma:
          mults.charisma *= power;
          mults.charisma_exp *= power;
          break;
        case FragmentType.HacknetMoney:
          mults.hacknet_node_money *= power;
          break;
        case FragmentType.HacknetCost:
          mults.hacknet_node_purchase_cost /= power;
          mults.hacknet_node_ram_cost /= power;
          mults.hacknet_node_core_cost /= power;
          mults.hacknet_node_level_cost /= power;
          break;
        case FragmentType.Rep:
          mults.company_rep *= power;
          mults.faction_rep *= power;
          break;
        case FragmentType.WorkMoney:
          mults.work_money *= power;
          break;
        case FragmentType.Crime:
          mults.crime_success *= power;
          mults.crime_money *= power;
          break;
        case FragmentType.Bladeburner:
          mults.bladeburner_max_stamina *= power;
          mults.bladeburner_stamina_gain *= power;
          mults.bladeburner_analysis *= power;
          mults.bladeburner_success_chance *= power;
          break;
      }
    }
    return mults;
  }

  updateMults(): void {
    // applyEntropy also reapplies all augmentations and source files
    // This wraps up the reset nicely
    Player.applyEntropy(Player.entropy);
    const mults = this.calculateMults();
    Player.mults = mergeMultipliers(Player.mults, mults);
    Player.updateSkillLevels();
    const zoeAmt = Player.sleeves.reduce((n, sleeve) => n + (sleeve.hasAugmentation(AugmentationName.ZOE) ? 1 : 0), 0);
    if (zoeAmt === 0) return;
    // Less powerful for each copy.
    const scaling = 3 / (zoeAmt + 2);
    const sleeveMults = scaleMultipliers(mults, scaling);
    for (const sleeve of Player.sleeves) {
      if (!sleeve.hasAugmentation(AugmentationName.ZOE)) continue;
      sleeve.resetMultipliers();
      //reapplying augmentation's multiplier
      for (let i = 0; i < sleeve.augmentations.length; ++i) {
        const aug = StaticAugmentations[sleeve.augmentations[i].name];
        sleeve.applyAugmentation(aug);
      }
      //applying stanek multiplier
      sleeve.mults = mergeMultipliers(sleeve.mults, sleeveMults);
      sleeve.updateSkillLevels();
    }
  }

  prestigeAugmentation(): void {
    this.clearCharge();
  }

  prestigeSourceFile(): void {
    this.clear();
    this.storedCycles = 0;
  }

  static includedProperties = getKeyList(StaneksGift, { removedKeys: ["justCharged"] });

  /** Serialize Staneks Gift to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("StaneksGift", this, StaneksGift.includedProperties);
  }

  /** Initializes Staneks Gift from a JSON save state */
  static fromJSON(value: IReviverValue): StaneksGift {
    return Generic_fromJSON(StaneksGift, value.data, StaneksGift.includedProperties);
  }
}

constructorsForReviver.StaneksGift = StaneksGift;
