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
    const lines = ["效果："];
    if (this.mults.str != null) {
      lines.push(`+${formatPercent(this.mults.str - 1, 0)} 力量技能`);
      lines.push(`+${formatPercent((this.mults.str - 1) / 4, 2)} 力量经验`);
    }
    if (this.mults.def != null) {
      lines.push(`+${formatPercent(this.mults.def - 1, 0)} 防御技能`);
      lines.push(`+${formatPercent((this.mults.def - 1) / 4, 2)} 防御经验`);
    }
    if (this.mults.dex != null) {
      lines.push(`+${formatPercent(this.mults.dex - 1, 0)} 灵巧技能`);
      lines.push(`+${formatPercent((this.mults.dex - 1) / 4, 2)} 灵巧经验`);
    }
    if (this.mults.agi != null) {
      lines.push(`+${formatPercent(this.mults.agi - 1, 0)} 敏捷技能`);
      lines.push(`+${formatPercent((this.mults.agi - 1) / 4, 2)} 敏捷经验`);
    }
    if (this.mults.cha != null) {
      lines.push(`+${formatPercent(this.mults.cha - 1, 0)} 魅力技能`);
      lines.push(`+${formatPercent((this.mults.cha - 1) / 4, 2)} 魅力经验`);
    }
    if (this.mults.hack != null) {
      lines.push(`+${formatPercent(this.mults.hack - 1, 0)} 黑客技能`);
      lines.push(`+${formatPercent((this.mults.hack - 1) / 4, 2)} 黑客经验`);
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
      default:
        return "";
    }
  }
}
