import React, { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Sleeve } from "../../PersonObjects/Sleeve/Sleeve";
import { Money } from "../../ui/React/Money";
import { Augmentation } from "../../Augmentation/Augmentation";
import { Augmentations } from "../../Augmentation/Augmentations";
import { Player } from "@player";
import { MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useRerender } from "../../ui/React/hooks";
import { Multipliers } from "../../PersonObjects/Multipliers";
import { Factions } from "../../Faction/Factions";
import { AugmentationName, FactionName } from "@enums";
import { formatNumber } from "../../ui/formatNumber";
import Tooltip from "@mui/material/Tooltip";
import { KarmaAvailable } from "./KarmaAvailable";

export function findAugs(sleeve: Sleeve): Augmentation[] {
  if (sleeve.shock > 0) return [];

  const ownedAugNames = sleeve.augmentations.map((e) => e.name);
  const availableAugs: Augmentation[] = [];

  function hasAugPrereqs(aug: Augmentation): boolean {
    return aug.prereqs.every((aug) => sleeve.hasAugmentation(aug));
  }
  function isAvailableForSleeve(aug: Augmentation): boolean {
    if (ownedAugNames.includes(aug.name)) return false;
    if (availableAugs.includes(aug)) return false;
    if (aug.isSpecial) return false;
    if (!hasAugPrereqs(aug)) return false;

    type MultKey = keyof Multipliers;
    const validMults: MultKey[] = [
      "hacking",
      "strength",
      "defense",
      "dexterity",
      "agility",
      "charisma",
      "hacking_exp",
      "strength_exp",
      "defense_exp",
      "dexterity_exp",
      "agility_exp",
      "charisma_exp",
      "company_rep",
      "faction_rep",
      "crime_money",
      "crime_success",
      "charity_money",
      "charity_success",
      "work_money",
    ];
    for (const mult of validMults) {
      if (aug.mults[mult] !== 1) return true;
    }

    return false;
  }

  for (const faction in Factions) {
    if (faction === FactionName.Bladeburners) continue;
    if (faction === FactionName.Netburners) continue;
    const fac = Factions[faction as FactionName]; //Factions[facName];
    if (!fac) continue;

    for (const augName in Augmentations) {
      const aug = Augmentations[augName as AugmentationName];
      if (!isAvailableForSleeve(aug)) continue;
      availableAugs.push(aug);
    }
  }

  // Add the stanek sleeve aug
  if (!ownedAugNames.includes(AugmentationName.ZOE) && Player.factions.includes(FactionName.ChurchOfTheMachineGod)) {
    const aug = Augmentations[AugmentationName.ZOE];
    availableAugs.push(aug);
  }

  return availableAugs;
}

/** React Component for the popup that manages Karma spending */
export function KarmaSleeveAugmentsSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const rerender = useRerender();
  const [currentCategory, setCurrentCategory] = useState("0");
  const upgrades = findAugs(Player.sleeves[Number(currentCategory)]);
  const upgFiltered = upgrades.filter((aug) => {
    return Math.sqrt(aug.baseCost * 2) > Player.karma ? false : true;
  });
  upgFiltered.sort((a, b) => a.baseCost - b.baseCost);
  const nextUpgrades = upgrades.filter((aug) => {
    return Math.sqrt(aug.baseCost * 2) > Player.karma ? true : false;
  });
  nextUpgrades.sort((a, b) => a.baseCost - b.baseCost);
  const onChange = (event: SelectChangeEvent): void => {
    setCurrentCategory(event.target.value);
    rerender();
  };
  const sleeves: string[] = [];
  for (let slv = 0; slv < Player.sleeves.length; slv++) {
    sleeves.push(Player.sleeves[slv].whoAmI());
  }
  const categories: Record<string, string[][]> = {
    Sleeves: [sleeves],
  };
  interface INextRevealProps {
    upgrades: Augmentation[];
    sleeve: Sleeve;
  }
  interface IUpgradeButtonProps {
    upg: Augmentation;
    rerender: () => void;
    sleeve: Sleeve;
  }
  function UpgradeButton(props: IUpgradeButtonProps): React.ReactElement {
    function onClick(): void {
      if (Math.sqrt(props.upg.baseCost * 2) > Player.karma) return;
      props.sleeve.installAugmentation(props.upg);
      Player.karma -= Math.sqrt(props.upg.baseCost * 2);
      charityORG.addKarmaMessage(
        "Spent " +
          formatNumber(Math.sqrt(props.upg.baseCost * 2), 0) +
          " on " +
          props.upg.name +
          " for sleeves #" +
          currentCategory,
      );
      props.rerender();
    }
    const mults = String(
      Object.entries(props.upg.mults)
        .filter((mult) => {
          return mult[1] > 1 || mult[1] < 1 ? true : false;
        })
        .map((m) => m[0] + ": " + m[1]),
    );
    const unlocks = String(
      Object.entries(Augmentations)
        .filter((aug) => {
          return aug[1].prereqs.includes(props.upg.name);
        })
        .map((aug) => "\n" + aug[0]),
    );
    const unlocksstr = unlocks.length > 0 ? "\nUnlocks: " + unlocks : "";

    return (
      <span>
        <Tooltip
          title={
            <Typography variant="body1">
              Gives: {mults}
              <br></br>
              {unlocksstr}
            </Typography>
          }
        >
          <Button onClick={onClick} sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <Typography>{props.upg.name}</Typography>
            <Money money={Math.sqrt(props.upg.baseCost * 2)} />
          </Button>
        </Tooltip>
      </span>
    );
  }
  //backgroundColor: "inherit",
  function NextReveal(props: INextRevealProps): React.ReactElement {
    const upgrades = props.upgrades.sort((a, b) => {
      return a.baseCost - b.baseCost;
    });
    if (upgrades.length === 0) return <></>;
    return (
      <Typography>
        Next at <Money money={Math.sqrt(upgrades[0].baseCost * 2)} />
      </Typography>
    );
  }

  return (
    <>
      <Box display="flex">
        <Typography>
          <br></br>Choose your Sleeve:
        </Typography>
      </Box>
      <span>
        <Select onChange={onChange} value={currentCategory} sx={{ width: "15%", mb: 1 }}>
          {Object.keys(categories.Sleeves[0]).map((k, i) => (
            <MenuItem key={i + 1} value={k}>
              <Typography variant="h6">{Player.sleeves.length === i ? "All" : "Sleeve: " + k}</Typography>
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ width: "100%" }}>
          {upgFiltered.length === 0 && <Typography>No upgrades available!</Typography>}
          <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", width: "100%" }}>
            {(upgFiltered as Augmentation[]).map((upg, i) => (
              <UpgradeButton key={i} rerender={rerender} sleeve={Player.sleeves[Number(currentCategory)]} upg={upg} />
            ))}
          </Box>
          <NextReveal sleeve={Player.sleeves[Number(currentCategory)] as Sleeve} upgrades={nextUpgrades} />
          <KarmaAvailable />
        </Box>
      </span>
    </>
  );
}
