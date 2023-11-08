import { charityVolunteerUpgradesMetadata } from "./data/upgrades";
import { CharityVolunteerUpgrade } from "./CharityVolunteerUpgrade";

export const CharityVolunteerUpgrades: Record<string, CharityVolunteerUpgrade> = {};

(function () {
  charityVolunteerUpgradesMetadata.forEach((e) => {
    CharityVolunteerUpgrades[e.name] = new CharityVolunteerUpgrade(e.name, e.cost, e.upgType, e.mults);
  });
})();
