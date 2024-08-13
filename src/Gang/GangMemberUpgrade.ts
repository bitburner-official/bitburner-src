import { IMults, UpgradeType } from "./data/upgrades";
import { formatPercent, FormatsHaveChanged } from "../ui/formatNumber";

export class GangMemberUpgrade {
  name: string;
  cost: number;
  type: UpgradeType;
  desc: string;
  mults: IMults;

  constructor(name = "", cost = 0, type: UpgradeType = UpgradeType.Weapon, mults: IMults = {}) {
    this.name = name;
    this.cost = cost;
    this.type = type;
    this.mults = mults;
    // No initialization because it depend on number formatter config
    this.desc = "";
    FormatsHaveChanged.subscribe(() => (this.desc = this.createDescription()));
  }

  createDescription(): string {
    const lines = ["Effects:"];
    if (this.mults.str != null) {
      lines.push(`+${formatPercent(this.mults.str - 1, 0)} strength skill`);
      lines.push(`+${formatPercent((this.mults.str - 1) / 4, 2)} strength exp`);
    }
    if (this.mults.def != null) {
      lines.push(`+${formatPercent(this.mults.def - 1, 0)} defense skill`);
      lines.push(`+${formatPercent((this.mults.def - 1) / 4, 2)} defense exp`);
    }
    if (this.mults.dex != null) {
      lines.push(`+${formatPercent(this.mults.dex - 1, 0)} dexterity skill`);
      lines.push(`+${formatPercent((this.mults.dex - 1) / 4, 2)} dexterity exp`);
    }
    if (this.mults.agi != null) {
      lines.push(`+${formatPercent(this.mults.agi - 1, 0)} agility skill`);
      lines.push(`+${formatPercent((this.mults.agi - 1) / 4, 2)} agility exp`);
    }
    if (this.mults.cha != null) {
      lines.push(`+${formatPercent(this.mults.cha - 1, 0)} charisma skill`);
      lines.push(`+${formatPercent((this.mults.cha - 1) / 4, 2)} charisma exp`);
    }
    if (this.mults.hack != null) {
      lines.push(`+${formatPercent(this.mults.hack - 1, 0)} hacking skill`);
      lines.push(`+${formatPercent((this.mults.hack - 1) / 4, 2)} hacking exp`);
    }
    return lines.join("<br>");
  }

  // User friendly version of type.
  getType(): string {
    switch (this.type) {
      case UpgradeType.Weapon:
        return "Weapon";
      case UpgradeType.Armor:
        return "Armor";
      case UpgradeType.Vehicle:
        return "Vehicle";
      case UpgradeType.Rootkit:
        return "Rootkit";
      case UpgradeType.Augmentation:
        return "Augmentation";
      case UpgradeType.Equipment:
        return "Equipment";
      default:
        return "";
    }
  }
}
