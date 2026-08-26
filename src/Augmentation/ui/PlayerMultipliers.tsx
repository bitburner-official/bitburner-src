import { DoubleArrow } from "@mui/icons-material";
import { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import * as React from "react";
import { Multipliers, defaultMultipliers, mergeMultipliers } from "../../PersonObjects/Multipliers";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";
import { formatPercent } from "../../ui/formatNumber";
import { Augmentations } from "../Augmentations";
import { canAccessBitNodeFeature } from "../../BitNode/BitNodeUtils";

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
  if (props.mult === 1 || !canAccessBitNodeFeature(5)) {
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
                  {current !== augmented && (
                    <>
                      <DoubleArrow fontSize="small" color="success" sx={{ mb: 0.5, mx: 1 }} />
                      <BitNodeModifiedStats base={augmented} mult={bnMult} color={Settings.theme.success} />
                    </>
                  )}
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
        mult: "入侵成功率",
        current: Player.mults.hacking_chance,
        augmented: Player.mults.hacking_chance * mults.hacking_chance,
      },
      {
        mult: "入侵速度",
        current: Player.mults.hacking_speed,
        augmented: Player.mults.hacking_speed * mults.hacking_speed,
        bnMult: currentNodeMults.HackingSpeedMultiplier,
      },
      {
        mult: "入侵收入",
        current: Player.mults.hacking_money,
        augmented: Player.mults.hacking_money * mults.hacking_money,
        bnMult: currentNodeMults.ScriptHackMoney,
      },
      {
        mult: "增长威力",
        current: Player.mults.hacking_grow,
        augmented: Player.mults.hacking_grow * mults.hacking_grow,
      },
      {
        mult: "黑客等级",
        current: Player.mults.hacking,
        augmented: Player.mults.hacking * mults.hacking,
        bnMult: currentNodeMults.HackingLevelMultiplier,
      },
      {
        mult: "黑客经验",
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
        mult: "力量等级",
        current: Player.mults.strength,
        augmented: Player.mults.strength * mults.strength,
        bnMult: currentNodeMults.StrengthLevelMultiplier,
      },
      {
        mult: "力量经验",
        current: Player.mults.strength_exp,
        augmented: Player.mults.strength_exp * mults.strength_exp,
      },
      {
        mult: "防御等级",
        current: Player.mults.defense,
        augmented: Player.mults.defense * mults.defense,
        bnMult: currentNodeMults.DefenseLevelMultiplier,
      },
      {
        mult: "防御经验",
        current: Player.mults.defense_exp,
        augmented: Player.mults.defense_exp * mults.defense_exp,
      },
      {
        mult: "灵巧等级",
        current: Player.mults.dexterity,
        augmented: Player.mults.dexterity * mults.dexterity,
        bnMult: currentNodeMults.DexterityLevelMultiplier,
      },
      {
        mult: "灵巧经验",
        current: Player.mults.dexterity_exp,
        augmented: Player.mults.dexterity_exp * mults.dexterity_exp,
      },
      {
        mult: "敏捷等级",
        current: Player.mults.agility,
        augmented: Player.mults.agility * mults.agility,
        bnMult: currentNodeMults.AgilityLevelMultiplier,
      },
      {
        mult: "敏捷经验",
        current: Player.mults.agility_exp,
        augmented: Player.mults.agility_exp * mults.agility_exp,
      },
    ].map((data: MultiplierListItemData) =>
      Object.defineProperty(data, "color", {
        value: Settings.theme.combat,
      }),
    ),
    {
      mult: "魅力等级",
      current: Player.mults.charisma,
      augmented: Player.mults.charisma * mults.charisma,
      bnMult: currentNodeMults.CharismaLevelMultiplier,
      color: Settings.theme.cha,
    },
    {
      mult: "魅力经验",
      current: Player.mults.charisma_exp,
      augmented: Player.mults.charisma_exp * mults.charisma_exp,
      color: Settings.theme.cha,
    },
  ];
  const rightColData: MultiplierListItemData[] = [
    {
      mult: "Hacknet 产出",
      current: Player.mults.hacknet_node_money,
      augmented: Player.mults.hacknet_node_money * mults.hacknet_node_money,
      bnMult: currentNodeMults.HacknetNodeMoney,
    },
    {
      mult: "Hacknet 购买成本",
      current: Player.mults.hacknet_node_purchase_cost,
      augmented: Player.mults.hacknet_node_purchase_cost * mults.hacknet_node_purchase_cost,
    },
    {
      mult: "Hacknet RAM 升级成本",
      current: Player.mults.hacknet_node_ram_cost,
      augmented: Player.mults.hacknet_node_ram_cost * mults.hacknet_node_ram_cost,
    },
    {
      mult: "Hacknet 核心购买成本",
      current: Player.mults.hacknet_node_core_cost,
      augmented: Player.mults.hacknet_node_core_cost * mults.hacknet_node_core_cost,
    },
    {
      mult: "Hacknet 等级升级成本",
      current: Player.mults.hacknet_node_level_cost,
      augmented: Player.mults.hacknet_node_level_cost * mults.hacknet_node_level_cost,
    },
    {
      mult: "公司声望获取",
      current: Player.mults.company_rep,
      augmented: Player.mults.company_rep * mults.company_rep,
      bnMult: currentNodeMults.CompanyWorkRepGain,
      color: Settings.theme.combat,
    },
    {
      mult: "派系声望获取",
      current: Player.mults.faction_rep,
      augmented: Player.mults.faction_rep * mults.faction_rep,
      bnMult: currentNodeMults.FactionWorkRepGain,
      color: Settings.theme.combat,
    },
    {
      mult: "薪资",
      current: Player.mults.work_money,
      augmented: Player.mults.work_money * mults.work_money,
      bnMult: currentNodeMults.CompanyWorkMoney,
      color: Settings.theme.money,
    },
    {
      mult: "犯罪成功率",
      current: Player.mults.crime_success,
      augmented: Player.mults.crime_success * mults.crime_success,
      bnMult: currentNodeMults.CrimeSuccessRate,
      color: Settings.theme.combat,
    },
    {
      mult: "犯罪收入",
      current: Player.mults.crime_money,
      augmented: Player.mults.crime_money * mults.crime_money,
      bnMult: currentNodeMults.CrimeMoney,
      color: Settings.theme.money,
    },
    {
      mult: "暗网收入",
      current: Player.mults.dnet_money,
      augmented: Player.mults.dnet_money * mults.dnet_money,
      bnMult: currentNodeMults.DarknetMoneyMultiplier,
      color: Settings.theme.money,
    },
  ];

  if (Player.canAccessBladeburner() && currentNodeMults.BladeburnerRank > 0) {
    rightColData.push(
      {
        mult: "Bladeburner 成功率",
        current: Player.mults.bladeburner_success_chance,
        augmented: Player.mults.bladeburner_success_chance * mults.bladeburner_success_chance,
      },
      {
        mult: "Bladeburner 最大体力",
        current: Player.mults.bladeburner_max_stamina,
        augmented: Player.mults.bladeburner_max_stamina * mults.bladeburner_max_stamina,
      },
      {
        mult: "Bladeburner 体力获取",
        current: Player.mults.bladeburner_stamina_gain,
        augmented: Player.mults.bladeburner_stamina_gain * mults.bladeburner_stamina_gain,
      },
      {
        mult: "Bladeburner 现场分析",
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
