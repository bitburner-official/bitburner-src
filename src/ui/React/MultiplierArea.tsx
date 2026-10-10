import { Sleeve as SleeveType } from "../../PersonObjects/Sleeve/Sleeve";
import { PlayerObject as PlayerType } from "../../PersonObjects/Player/PlayerObject";

import { Table, TableBody, Box, Typography, Tooltip } from "@mui/material";
import { Info } from "@mui/icons-material";
import React from "react";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Settings } from "../../Settings/Settings";
import { Player } from "@player";
import { formatPercent, formatNumber } from "../formatNumber";
import { StatsRow } from "./StatsRow";
import { getMaxRep } from "../../Go/effects/effect";
import { canAccessBitNodeFeature } from "../../BitNode/BitNodeUtils";

interface IMultRow {
  // The name of the multiplier
  mult: string;

  // The player's raw multiplier value
  value: number;

  // The player's effective multiplier value, affected by BitNode mults
  effValue?: number;

  // The text color for the row
  color?: string;

  // Whether to format as percent or scalar
  isNumber?: boolean;
}

interface MultiplierTableData {
  key: string;
  rows: IMultRow[];
  color: string;
  noMargin?: boolean;
}

type PersonTypeProp = SleeveType | PlayerType;

function getMultiplierTableData(props: PersonTypeProp): {
  leftColumn: MultiplierTableData[];
  rightColumn: MultiplierTableData[];
} {
  let leftColumn: MultiplierTableData[] = [];
  if (!(props instanceof SleeveType)) {
    leftColumn.push({
      key: "hacking-rates",
      color: Settings.theme.hack,
      rows: [
        {
          mult: "Hacking Chance",
          value: props.mults.hacking_chance,
        },
        {
          mult: "Hacking Speed",
          value: props.mults.hacking_speed,
          effValue: props.mults.hacking_speed * currentNodeMults.HackingSpeedMultiplier,
        },
        {
          mult: "Hacking Money",
          value: props.mults.hacking_money,
          effValue: props.mults.hacking_money * currentNodeMults.ScriptHackMoney,
        },
        {
          mult: "Hacking Growth",
          value: props.mults.hacking_grow,
          effValue: props.mults.hacking_grow * currentNodeMults.ServerGrowthRate,
        },
      ],
    });
  }

  leftColumn = leftColumn.concat([
    {
      key: "hacking-level-exp",
      color: Settings.theme.hack,
      rows: [
        {
          mult: "Hacking Level",
          value: props.mults.hacking,
          effValue: props.mults.hacking * currentNodeMults.HackingLevelMultiplier,
        },
        {
          mult: "Hacking Experience",
          value: props.mults.hacking_exp,
          effValue: props.mults.hacking_exp * currentNodeMults.HackExpGain,
        },
      ],
    },
    {
      key: "strength",
      color: Settings.theme.combat,
      rows: [
        {
          mult: "Strength Level",
          value: props.mults.strength,
          effValue: props.mults.strength * currentNodeMults.StrengthLevelMultiplier,
        },
        {
          mult: "Strength Experience",
          value: props.mults.strength_exp,
        },
      ],
    },
    {
      key: "defense",
      color: Settings.theme.combat,
      rows: [
        {
          mult: "Defense Level",
          value: props.mults.defense,
          effValue: props.mults.defense * currentNodeMults.DefenseLevelMultiplier,
        },
        {
          mult: "Defense Experience",
          value: props.mults.defense_exp,
        },
      ],
    },
    {
      key: "dexterity",
      color: Settings.theme.combat,
      rows: [
        {
          mult: "Dexterity Level",
          value: props.mults.dexterity,
          effValue: props.mults.dexterity * currentNodeMults.DexterityLevelMultiplier,
        },
        {
          mult: "Dexterity Experience",
          value: props.mults.dexterity_exp,
        },
      ],
    },
    {
      key: "agility",
      color: Settings.theme.combat,
      rows: [
        {
          mult: "Agility Level",
          value: props.mults.agility,
          effValue: props.mults.agility * currentNodeMults.AgilityLevelMultiplier,
        },
        {
          mult: "Agility Experience",
          value: props.mults.agility_exp,
        },
      ],
    },
    {
      key: "charisma",
      color: Settings.theme.cha,
      noMargin: true,
      rows: [
        {
          mult: "Charisma Level",
          value: props.mults.charisma,
          effValue: props.mults.charisma * currentNodeMults.CharismaLevelMultiplier,
        },
        {
          mult: "Charisma Experience",
          value: props.mults.charisma_exp,
        },
      ],
    },
  ]);

  let rightColumn: MultiplierTableData[] = [];
  if (!(props instanceof SleeveType)) {
    rightColumn.push({
      key: "hacknet",
      color: Settings.theme.primary,
      rows: [
        {
          mult: "Hacknet Production",
          value: props.mults.hacknet_node_money,
          effValue: props.mults.hacknet_node_money * currentNodeMults.HacknetNodeMoney,
        },
        {
          mult: "Hacknet Purchase Cost",
          value: props.mults.hacknet_node_purchase_cost,
        },
        {
          mult: "Hacknet RAM Upgrade Cost",
          value: props.mults.hacknet_node_ram_cost,
        },
        {
          mult: "Hacknet Core Purchase Cost",
          value: props.mults.hacknet_node_core_cost,
        },
        {
          mult: "Hacknet Level Upgrade Cost",
          value: props.mults.hacknet_node_level_cost,
        },
      ],
    });
  }
  rightColumn = rightColumn.concat([
    {
      key: "work",
      color: Settings.theme.money,
      rows: [
        {
          mult: "Company Reputation Gain",
          value: props.mults.company_rep,
          effValue: props.mults.company_rep * currentNodeMults.CompanyWorkRepGain,
          color: Settings.theme.rep,
        },
        {
          mult: "Faction Reputation Gain",
          value: props.mults.faction_rep,
          effValue: props.mults.faction_rep * currentNodeMults.FactionWorkRepGain,
          color: Settings.theme.rep,
        },
        {
          mult: "Salary",
          value: props.mults.work_money,
          effValue: props.mults.work_money * currentNodeMults.CompanyWorkMoney,
          color: Settings.theme.money,
        },
      ],
    },
    {
      key: "crime",
      color: Settings.theme.combat,
      rows: [
        {
          mult: "Crime Success Chance",
          value: props.mults.crime_success,
          effValue: props.mults.crime_success * currentNodeMults.CrimeSuccessRate,
        },
        {
          mult: "Crime Money",
          value: props.mults.crime_money,
          effValue: props.mults.crime_money * currentNodeMults.CrimeMoney,
          color: Settings.theme.money,
        },
      ],
    },
  ]);

  if (!(props instanceof SleeveType)) {
    rightColumn.push({
      key: "darknet",
      color: Settings.theme.money,
      rows: [
        {
          mult: "Darknet Money",
          value: props.mults.dnet_money,
          effValue: props.mults.dnet_money * currentNodeMults.DarknetMoneyMultiplier,
        },
      ],
    });

    if (Player.canAccessBladeburner() && currentNodeMults.BladeburnerRank > 0) {
      rightColumn.push({
        key: "bladeburner",
        color: Settings.theme.primary,
        noMargin: !canAccessBitNodeFeature(14),
        rows: [
          {
            mult: "Bladeburner Success Chance",
            value: props.mults.bladeburner_success_chance,
          },
          {
            mult: "Bladeburner Max Stamina",
            value: props.mults.bladeburner_max_stamina,
          },
          {
            mult: "Bladeburner Stamina Gain",
            value: props.mults.bladeburner_stamina_gain,
          },
          {
            mult: "Bladeburner Field Analysis",
            value: props.mults.bladeburner_analysis,
          },
        ],
      });
    }

    if (canAccessBitNodeFeature(14)) {
      rightColumn.push({
        key: "ipvgo",
        color: Settings.theme.combat,
        noMargin: true,
        rows: [
          {
            mult: "IPvGO Node Power bonus",
            value: Player.activeSourceFileLvl(14) ? 2 * currentNodeMults.GoPower : currentNodeMults.GoPower,
          },
          {
            mult: "IPvGO Max Rep Converted to Favor",
            value: getMaxRep(),
            isNumber: true,
          },
        ],
      });
    }
  }

  return { leftColumn, rightColumn };
}

interface MultTableProps {
  rows: IMultRow[];
  color: string;
  noMargin?: boolean;
}

export function MultiplierTable(props: MultTableProps): React.ReactElement {
  return (
    <Table sx={{ display: "table", width: "100%", mb: props.noMargin ? 0 : 2 }}>
      <TableBody>
        {props.rows.map((data) => {
          const { mult, value, effValue = null, color = props.color } = data;

          if (effValue !== null && effValue !== value && canAccessBitNodeFeature(5)) {
            return (
              <StatsRow key={mult} name={mult} color={color} data={{}}>
                <>
                  <Typography color={color}>
                    {data.isNumber ? (
                      formatNumber(value, 0)
                    ) : (
                      <>
                        <span style={{ opacity: 0.5 }}>{formatPercent(value)}</span> {formatPercent(effValue)}
                      </>
                    )}
                  </Typography>
                </>
              </StatsRow>
            );
          }
          return (
            <StatsRow
              key={mult}
              name={mult}
              color={color}
              data={{ content: data.isNumber ? formatNumber(value, 0) : formatPercent(value) }}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}

export function MultiplierArea(person: PersonTypeProp): React.ReactElement {
  const { leftColumn, rightColumn } = getMultiplierTableData(person);
  const possessive = person instanceof PlayerType ? "your" : "this sleeve's";

  return (
    <>
      <Typography variant="h5" color="primary" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        Multipliers
        {canAccessBitNodeFeature(5) && (
          <Tooltip
            title={
              <Typography>
                Displays {`${possessive}`} current multipliers.
                <br />
                <br />
                When there is a dim number next to a multiplier, that means that the multiplier in question is being
                affected by BitNode multipliers.
                <br />
                <br />
                The dim number is the raw multiplier, and the undimmed number is the effective multiplier, as dictated
                by the BitNode.
              </Typography>
            }
          >
            <Info sx={{ ml: 1, mb: 0.5 }} color="info" />
          </Tooltip>
        )}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <Box>
          {leftColumn.map((t) => (
            <MultiplierTable key={t.key} rows={t.rows} color={t.color} noMargin={t.noMargin} />
          ))}
        </Box>
        <Box>
          {rightColumn.map((t) => (
            <MultiplierTable key={t.key} rows={t.rows} color={t.color} noMargin={t.noMargin} />
          ))}
        </Box>
      </Box>
    </>
  );
}
