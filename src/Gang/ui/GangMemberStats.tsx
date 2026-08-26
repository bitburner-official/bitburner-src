/**
 * React Component for the first part of a gang member details.
 * Contains skills and exp.
 */
import React from "react";
import { useGang } from "./Context";

import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

import { formatMultiplier, formatRespect, formatWanted } from "../../ui/formatNumber";
import { GangMember } from "../GangMember";
import { Settings } from "../../Settings/Settings";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { StatsRow } from "../../ui/React/StatsRow";
import { useStyles } from "../../ui/React/CharacterOverview";
import { getKeyFromReactElements } from "../../utils/StringHelperFunctions";

interface IProps {
  member: GangMember;
}

export function GangMemberStats(props: IProps): React.ReactElement {
  const { classes } = useStyles();

  const asc = {
    hack: props.member.calculateAscensionMult(props.member.hack_asc_points),
    str: props.member.calculateAscensionMult(props.member.str_asc_points),
    def: props.member.calculateAscensionMult(props.member.def_asc_points),
    dex: props.member.calculateAscensionMult(props.member.dex_asc_points),
    agi: props.member.calculateAscensionMult(props.member.agi_asc_points),
    cha: props.member.calculateAscensionMult(props.member.cha_asc_points),
  };

  const gang = useGang();
  const data = [
    [`资金：`, <MoneyRate key="money" money={5 * props.member.calculateMoneyGain(gang)} />],
    [`尊重：`, `${formatRespect(5 * props.member.calculateRespectGain(gang))} / 秒`],
    [`通缉等级：`, `${formatWanted(5 * props.member.calculateWantedLevelGain(gang))} / 秒`],
    [`累计尊重：`, `${formatRespect(props.member.earnedRespect)}`],
  ];

  return (
    <>
      <Tooltip
        title={
          <Typography>
            Hk: x{formatMultiplier(props.member.hack_mult * asc.hack)}（x
            {formatMultiplier(props.member.hack_mult)} 装备，x{formatMultiplier(asc.hack)} 飞升）
            <br />
            St: x{formatMultiplier(props.member.str_mult * asc.str)}
            （x{formatMultiplier(props.member.str_mult)} 装备，x{formatMultiplier(asc.str)} 飞升）
            <br />
            Df: x{formatMultiplier(props.member.def_mult * asc.def)}
            （x{formatMultiplier(props.member.def_mult)} 装备，x{formatMultiplier(asc.def)} 飞升）
            <br />
            Dx: x{formatMultiplier(props.member.dex_mult * asc.dex)}
            （x{formatMultiplier(props.member.dex_mult)} 装备，x{formatMultiplier(asc.dex)} 飞升）
            <br />
            Ag: x{formatMultiplier(props.member.agi_mult * asc.agi)}
            （x{formatMultiplier(props.member.agi_mult)} 装备，x{formatMultiplier(asc.agi)} 飞升）
            <br />
            Ch: x{formatMultiplier(props.member.cha_mult * asc.cha)}
            （x{formatMultiplier(props.member.cha_mult)} 装备，x{formatMultiplier(asc.cha)} 飞升）
          </Typography>
        }
      >
        <Table sx={{ display: "table", mb: 1, width: "100%" }}>
          <TableBody>
            <StatsRow
              name="黑客"
              color={Settings.theme.hack}
              data={{ level: props.member.hack, exp: props.member.hack_exp }}
            />
            <StatsRow
              name="力量"
              color={Settings.theme.combat}
              data={{ level: props.member.str, exp: props.member.str_exp }}
            />
            <StatsRow
              name="防御"
              color={Settings.theme.combat}
              data={{ level: props.member.def, exp: props.member.def_exp }}
            />
            <StatsRow
              name="灵巧"
              color={Settings.theme.combat}
              data={{ level: props.member.dex, exp: props.member.dex_exp }}
            />
            <StatsRow
              name="敏捷"
              color={Settings.theme.combat}
              data={{ level: props.member.agi, exp: props.member.agi_exp }}
            />
            <StatsRow
              name="魅力"
              color={Settings.theme.cha}
              data={{ level: props.member.cha, exp: props.member.cha_exp }}
            />
            <TableRow>
              <TableCell classes={{ root: classes.cellNone }}>
                <br />
              </TableCell>
            </TableRow>
            {data.map(([a, b]) => (
              <TableRow key={getKeyFromReactElements(a, b)}>
                <TableCell classes={{ root: classes.cellNone }}>
                  <Typography>{a}</Typography>
                </TableCell>
                <TableCell align="right" classes={{ root: classes.cellNone }}>
                  <Typography>{b}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tooltip>
    </>
  );
}
