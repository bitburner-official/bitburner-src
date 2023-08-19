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

function BitNodeModifiedStats(props: IBitNodeModifiedStatsProps): React.ReactElement {
  // If player doesn't have SF5 or if the property isn't affected by BitNode mults
  if (props.mult === 1 || Player.sourceFileLvl(5) === 0)
    return <Typography color={props.color}>{formatPercent(props.base)}</Typography>;

  return (
    <Typography color={props.color}>
      <span style={{ opacity: 0.5 }}>{formatPercent(props.base)}</span> {formatPercent(props.base * props.mult)}
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
	const current = Player.mults;
	const rawEffect = Player.reapplyMultipliers();

  const leftColData: MultiplierListItemData[] = [
    ...[
      {
        mult: "Hacking Chance",
        current: current.hacking_chance,
        augmented: rawEffect.hacking_chance * mults.hacking_chance,
      },
      {
        mult: "Hacking Speed",
        current: current.hacking_speed,
        augmented: rawEffect.hacking_speed * mults.hacking_speed,
      },
      {
        mult: "Hacking Money",
        current: current.hacking_money,
        augmented: rawEffect.hacking_money * mults.hacking_money,
        bnMult: currentNodeMults.ScriptHackMoney,
      },
      {
        mult: "Hacking Growth",
        current: current.hacking_grow,
        augmented: rawEffect.hacking_grow * mults.hacking_grow,
      },
      {
        mult: "Hacking Level",
        current: current.hacking,
        augmented: rawEffect.hacking * mults.hacking,
        bnMult: currentNodeMults.HackingLevelMultiplier,
      },
      {
        mult: "Hacking Experience",
        current: current.hacking_exp,
        augmented: rawEffect.hacking_exp * mults.hacking_exp,
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
        current: current.strength,
        augmented: rawEffect.strength * mults.strength,
        bnMult: currentNodeMults.StrengthLevelMultiplier,
      },
      {
        mult: "Strength Experience",
        current: current.strength_exp,
        augmented: rawEffect.strength_exp * mults.strength_exp,
      },
      {
        mult: "Defense Level",
        current: current.defense,
        augmented: rawEffect.defense * mults.defense,
        bnMult: currentNodeMults.DefenseLevelMultiplier,
      },
      {
        mult: "Defense Experience",
        current: current.defense_exp,
        augmented: rawEffect.defense_exp * mults.defense_exp,
      },
      {
        mult: "Dexterity Level",
        current: current.dexterity,
        augmented: rawEffect.dexterity * mults.dexterity,
        bnMult: currentNodeMults.DexterityLevelMultiplier,
      },
      {
        mult: "Dexterity Experience",
        current: current.dexterity_exp,
        augmented: rawEffect.dexterity_exp * mults.dexterity_exp,
      },
      {
        mult: "Agility Level",
        current: current.agility,
        augmented: rawEffect.agility * mults.agility,
        bnMult: currentNodeMults.AgilityLevelMultiplier,
      },
      {
        mult: "Agility Experience",
        current: current.agility_exp,
        augmented: rawEffect.agility_exp * mults.agility_exp,
      },
    ].map((data: MultiplierListItemData) =>
      Object.defineProperty(data, "color", {
        value: Settings.theme.combat,
      }),
    ),
    {
      mult: "Charisma Level",
      current: current.charisma,
      augmented: rawEffect.charisma * mults.charisma,
      bnMult: currentNodeMults.CharismaLevelMultiplier,
      color: Settings.theme.cha,
    },
    {
      mult: "Charisma Experience",
      current: current.charisma_exp,
      augmented: rawEffect.charisma_exp * mults.charisma_exp,
      color: Settings.theme.cha,
    },
		{
			mult: "Game Tick Speed",
			current: current.game_tick_speed,
			augmented: rawEffect.game_tick_speed * mults.game_tick_speed,
		}
  ];
  const rightColData: MultiplierListItemData[] = [
    {
      mult: "Hacknet Node Production",
      current: current.hacknet_node_money,
      augmented: rawEffect.hacknet_node_money * mults.hacknet_node_money,
      bnMult: currentNodeMults.HacknetNodeMoney,
    },
    {
      mult: "Hacknet Node Purchase Cost",
      current: current.hacknet_node_purchase_cost,
      augmented: rawEffect.hacknet_node_purchase_cost * mults.hacknet_node_purchase_cost,
    },
    {
      mult: "Hacknet Node RAM Upgrade Cost",
      current: current.hacknet_node_ram_cost,
      augmented: rawEffect.hacknet_node_ram_cost * mults.hacknet_node_ram_cost,
    },
    {
      mult: "Hacknet Node Core Purchase Cost",
      current: current.hacknet_node_core_cost,
      augmented: rawEffect.hacknet_node_core_cost * mults.hacknet_node_core_cost,
    },
    {
      mult: "Hacknet Node Level Upgrade Cost",
      current: current.hacknet_node_level_cost,
      augmented: rawEffect.hacknet_node_level_cost * mults.hacknet_node_level_cost,
    },
		{
			mult: "Purchased Server Cost",
			current: current.server_cost,
			augmented: rawEffect.server_cost * mults.server_cost,
		},
		{
			mult: "Home Ram Cost",
			current: current.home_ram_cost,
			augmented: rawEffect.home_ram_cost * mults.home_ram_cost,
			bnMult: currentNodeMults.HomeComputerRamCost,
		},
		{
			mult: "Home Core Cost",
			current: current.home_core_cost,
			augmented: rawEffect.home_core_cost * mults.home_core_cost,
		},
    {
      mult: "Company Reputation Gain",
      current: current.company_rep,
      augmented: rawEffect.company_rep * mults.company_rep,
      color: Settings.theme.combat,
    },
    {
      mult: "Faction Reputation Gain",
      current: current.faction_rep,
      augmented: rawEffect.faction_rep * mults.faction_rep,
      bnMult: currentNodeMults.FactionWorkRepGain,
      color: Settings.theme.combat,
    },
    {
      mult: "Salary",
      current: current.work_money,
      augmented: rawEffect.work_money * mults.work_money,
      bnMult: currentNodeMults.CompanyWorkMoney,
      color: Settings.theme.money,
    },
    {
      mult: "Crime Success Chance",
      current: current.crime_success,
      augmented: rawEffect.crime_success * mults.crime_success,
      color: Settings.theme.combat,
    },
    {
      mult: "Crime Money",
      current: current.crime_money,
      augmented: rawEffect.crime_money * mults.crime_money,
      bnMult: currentNodeMults.CrimeMoney,
      color: Settings.theme.money,
    },
		{
			mult: "Crime Karma Impact",
			current: current.crime_karma_impact,
			augmented: rawEffect.crime_karma_impact,
			color: Settings.theme.combat
		}
  ];

  if (Player.canAccessBladeburner() && currentNodeMults.BladeburnerRank > 0) {
    rightColData.push(
      {
        mult: "Bladeburner Success Chance",
        current: current.bladeburner_success_chance,
        augmented: rawEffect.bladeburner_success_chance * mults.bladeburner_success_chance,
      },
      {
        mult: "Bladeburner Max Stamina",
        current: current.bladeburner_max_stamina,
        augmented: rawEffect.bladeburner_max_stamina * mults.bladeburner_max_stamina,
      },
      {
        mult: "Bladeburner Stamina Gain",
        current: current.bladeburner_stamina_gain,
        augmented: rawEffect.bladeburner_stamina_gain * mults.bladeburner_stamina_gain,
      },
      {
        mult: "Bladeburner Field Analysis",
        current: current.bladeburner_analysis,
        augmented: rawEffect.bladeburner_analysis * mults.bladeburner_analysis,
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
