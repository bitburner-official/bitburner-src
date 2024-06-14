import { DoubleArrow } from "@mui/icons-material";
import { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import * as React from "react";
import { Multipliers, defaultMultipliers, mergeMultipliers } from "../../PersonObjects/Multipliers";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { formatPercent } from "../../ui/formatNumber";
import { Augmentations } from "../Augmentations";

function calculateAugmentedStats(): Multipliers {
  let augP: Multipliers = defaultMultipliers();
  for (const aug of Player.queuedAugmentations) {
    const augObj = Augmentations[aug.name];
    augP = mergeMultipliers(augP, augObj.mults);
  }
  return augP;
}

interface IBitNodeModifiedStatsProps {
  base: number;
  mult: number;
  color: string;
}

function customFormatPercent(value: number): string {
  return formatPercent(value, 2, 100);
}

function BitNodeModifiedStats(props: IBitNodeModifiedStatsProps): React.ReactElement {
  // If the player doesn't have access to SF5 feature or if the property isn't affected by BitNode mults
  if (props.mult === 1 || (Player.bitNodeN !== 5 && Player.sourceFileLvl(5) === 0)) {
    return <Typography color={props.color}>{customFormatPercent(props.base)}</Typography>;
  }

  return (
    <Typography color={props.color}>
      <span style={{ opacity: 0.5 }}>{customFormatPercent(props.base)}</span>{" "}
      {customFormatPercent(props.base * props.mult)}
    </Typography>
  );
}

interface MultiplierListItemData {
  mult: string;
  current: number;
  augmented: number;
  bnMult?: number;
  color?: string;
}

interface IMultiplierListProps {
  rows: MultiplierListItemData[];
}

function MultiplierList(props: IMultiplierListProps): React.ReactElement {
  const listItems = props.rows
    .map((data) => {
      const { mult, current, augmented, bnMult = 1, color = Settings.theme.primary } = data;

      if (!isNaN(augmented)) {
        return (
          <ListItem key={mult} disableGutters sx={{ py: 0 }}>
            <ListItemText
              sx={{ my: 0.1 }}
              primary={
                <Typography color={color}>
                  <b>{mult}</b>
                </Typography>
              }
              secondary={
                <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  <BitNodeModifiedStats base={current} mult={bnMult} color={color} />
                  <DoubleArrow fontSize="small" color="success" sx={{ mb: 0.5, mx: 1 }} />
                  <BitNodeModifiedStats base={augmented} mult={bnMult} color={Settings.theme.success} />
                </span>
              }
              disableTypography
            />
          </ListItem>
        );
      }
      return;
    })
    .filter((i) => i !== undefined);

  return listItems.length > 0 ? <List disablePadding>{listItems}</List> : <></>;
}

/** React component for displaying the player's multipliers on the Augmentation UI page */
export function PlayerMultipliers(): React.ReactElement {
  const mults = calculateAugmentedStats();

  const leftColData: MultiplierListItemData[] = [
    ...[
      {
        mult: "Hacking Chance",
        current: Player.mults.hacking_chance,
        augmented: Player.mults.hacking_chance * mults.hacking_chance,
      },
      {
        mult: "Hacking Speed",
        current: Player.mults.hacking_speed,
        augmented: Player.mults.hacking_speed * mults.hacking_speed,
        bnMult: currentNodeMults.HackingSpeedMultiplier,
      },
      {
        mult: "Hacking Money",
        current: Player.mults.hacking_money,
        augmented: Player.mults.hacking_money * mults.hacking_money,
        bnMult: currentNodeMults.ScriptHackMoney,
      },
      {
        mult: "Hacking Growth",
        current: Player.mults.hacking_grow,
        augmented: Player.mults.hacking_grow * mults.hacking_grow,
      },
      {
        mult: "Hacking Level",
        current: Player.mults.hacking,
        augmented: Player.mults.hacking * mults.hacking,
        bnMult: currentNodeMults.HackingLevelMultiplier,
      },
      {
        mult: "Hacking Experience",
        current: Player.mults.hacking_exp,
        augmented: Player.mults.hacking_exp * mults.hacking_exp,
        bnMult: currentNodeMults.HackExpGain,
      },
    ].map((data: MultiplierListItemData) =>
      Object.defineProperty(data, "color", {
        value: Settings.theme.hack,
      }),
    ),
    ...[
      {
        mult: "Strength Level",
        current: Player.mults.strength,
        augmented: Player.mults.strength * mults.strength,
        bnMult: currentNodeMults.StrengthLevelMultiplier,
      },
      {
        mult: "Strength Experience",
        current: Player.mults.strength_exp,
        augmented: Player.mults.strength_exp * mults.strength_exp,
      },
      {
        mult: "Defense Level",
        current: Player.mults.defense,
        augmented: Player.mults.defense * mults.defense,
        bnMult: currentNodeMults.DefenseLevelMultiplier,
      },
      {
        mult: "Defense Experience",
        current: Player.mults.defense_exp,
        augmented: Player.mults.defense_exp * mults.defense_exp,
      },
      {
        mult: "Dexterity Level",
        current: Player.mults.dexterity,
        augmented: Player.mults.dexterity * mults.dexterity,
        bnMult: currentNodeMults.DexterityLevelMultiplier,
      },
      {
        mult: "Dexterity Experience",
        current: Player.mults.dexterity_exp,
        augmented: Player.mults.dexterity_exp * mults.dexterity_exp,
      },
      {
        mult: "Agility Level",
        current: Player.mults.agility,
        augmented: Player.mults.agility * mults.agility,
        bnMult: currentNodeMults.AgilityLevelMultiplier,
      },
      {
        mult: "Agility Experience",
        current: Player.mults.agility_exp,
        augmented: Player.mults.agility_exp * mults.agility_exp,
      },
    ].map((data: MultiplierListItemData) =>
      Object.defineProperty(data, "color", {
        value: Settings.theme.combat,
      }),
    ),
    {
      mult: "Charisma Level",
      current: Player.mults.charisma,
      augmented: Player.mults.charisma * mults.charisma,
      bnMult: currentNodeMults.CharismaLevelMultiplier,
      color: Settings.theme.cha,
    },
    {
      mult: "Charisma Experience",
      current: Player.mults.charisma_exp,
      augmented: Player.mults.charisma_exp * mults.charisma_exp,
      color: Settings.theme.cha,
    },
  ];
  const rightColData: MultiplierListItemData[] = [
    {
      mult: "Hacknet Production",
      current: Player.mults.hacknet_node_money,
      augmented: Player.mults.hacknet_node_money * mults.hacknet_node_money,
      bnMult: currentNodeMults.HacknetNodeMoney,
    },
    {
      mult: "Hacknet Purchase Cost",
      current: Player.mults.hacknet_node_purchase_cost,
      augmented: Player.mults.hacknet_node_purchase_cost * mults.hacknet_node_purchase_cost,
    },
    {
      mult: "Hacknet RAM Upgrade Cost",
      current: Player.mults.hacknet_node_ram_cost,
      augmented: Player.mults.hacknet_node_ram_cost * mults.hacknet_node_ram_cost,
    },
    {
      mult: "Hacknet Core Purchase Cost",
      current: Player.mults.hacknet_node_core_cost,
      augmented: Player.mults.hacknet_node_core_cost * mults.hacknet_node_core_cost,
    },
    {
      mult: "Hacknet Level Upgrade Cost",
      current: Player.mults.hacknet_node_level_cost,
      augmented: Player.mults.hacknet_node_level_cost * mults.hacknet_node_level_cost,
    },
    {
      mult: "Company Reputation Gain",
      current: Player.mults.company_rep,
      augmented: Player.mults.company_rep * mults.company_rep,
      bnMult: currentNodeMults.CompanyWorkRepGain,
      color: Settings.theme.combat,
    },
    {
      mult: "Faction Reputation Gain",
      current: Player.mults.faction_rep,
      augmented: Player.mults.faction_rep * mults.faction_rep,
      bnMult: currentNodeMults.FactionWorkRepGain,
      color: Settings.theme.combat,
    },
    {
      mult: "Salary",
      current: Player.mults.work_money,
      augmented: Player.mults.work_money * mults.work_money,
      bnMult: currentNodeMults.CompanyWorkMoney,
      color: Settings.theme.money,
    },
    {
      mult: "Crime Success Chance",
      current: Player.mults.crime_success,
      augmented: Player.mults.crime_success * mults.crime_success,
      bnMult: currentNodeMults.CrimeSuccessRate,
      color: Settings.theme.combat,
    },
    {
      mult: "Crime Money",
      current: Player.mults.crime_money,
      augmented: Player.mults.crime_money * mults.crime_money,
      bnMult: currentNodeMults.CrimeMoney,
      color: Settings.theme.money,
    },
  ];

  if (Player.canAccessBladeburner() && currentNodeMults.BladeburnerRank > 0) {
    rightColData.push(
      {
        mult: "Bladeburner Success Chance",
        current: Player.mults.bladeburner_success_chance,
        augmented: Player.mults.bladeburner_success_chance * mults.bladeburner_success_chance,
      },
      {
        mult: "Bladeburner Max Stamina",
        current: Player.mults.bladeburner_max_stamina,
        augmented: Player.mults.bladeburner_max_stamina * mults.bladeburner_max_stamina,
      },
      {
        mult: "Bladeburner Stamina Gain",
        current: Player.mults.bladeburner_stamina_gain,
        augmented: Player.mults.bladeburner_stamina_gain * mults.bladeburner_stamina_gain,
      },
      {
        mult: "Bladeburner Field Analysis",
        current: Player.mults.bladeburner_analysis,
        augmented: Player.mults.bladeburner_analysis * mults.bladeburner_analysis,
      },
    );
  }

  return (
    <Paper
      sx={{
        p: 1,
        maxHeight: 400,
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <MultiplierList rows={leftColData} />
      <MultiplierList rows={rightColData} />
    </Paper>
  );
}
