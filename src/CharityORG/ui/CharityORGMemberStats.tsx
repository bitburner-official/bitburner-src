/**
 * React Component for the first part of a gang member details.
 * Contains skills and exp.
 */
import React from "react";
import { useCharityORG } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { formatMultiplier, formatNumber, formatSkill } from "../../ui/formatNumber";
import { CharityVolunteer } from "../CharityVolunteer";
import { Settings } from "../../Settings/Settings";
import { useStyles } from "../../ui/React/CharacterOverview";
const f = (x: number) => formatNumber(x, x >= 1000 ? 3 : 7);

interface IProps {
  member: CharityVolunteer;
}
export function CharityORGMemberStats(props: IProps): React.ReactElement {
  const classes = useStyles();

  const asc = {
    hack: props.member.calculateAscensionMult(props.member.hack_asc_points),
    str: props.member.calculateAscensionMult(props.member.str_asc_points),
    def: props.member.calculateAscensionMult(props.member.def_asc_points),
    dex: props.member.calculateAscensionMult(props.member.dex_asc_points),
    agi: props.member.calculateAscensionMult(props.member.agi_asc_points),
    cha: props.member.calculateAscensionMult(props.member.cha_asc_points),
  };

  const charityORG = useCharityORG();
  const data = [
    [`Money Gain:`, `$${f(props.member.calculateMoneyGain(charityORG) * 5)} / sec`],
    [`Money Spend:`, `$${f(props.member.calculateMoneySpend(charityORG) * 5)} / sec`],
    [`Karma:`, `${f(props.member.calculateKarmaGain(charityORG) * 5)} / sec`],
    [`Prestige:`, `${f(props.member.calculatePrestigeGain(charityORG) * 5)} / sec`],
    [`Visibility Level:`, `${f(props.member.calculateVisibilityGain(charityORG) * 5)} / sec`],
    [`Terror Level:`, `${f(props.member.calculateTerrorGain(charityORG) * 5)} / sec`],
    [`Total Prestige:`, `${f(props.member.earnedPrestige)}`],
  ];

  function exportStat(name: string, num: number, xp: number, color: string): React.ReactElement {
    return (
      <>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="left" sx={{ color: color }}>
            {name}
          </Typography>
        </TableCell>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="right" sx={{ color: color }}>
            {formatSkill(num)}
          </Typography>
        </TableCell>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="right" sx={{ color: color }}>
            {"(" + formatNumber(xp) + ")"}
          </Typography>
        </TableCell>
        <TableCell classes={{ root: classes.cellNone }}>
          <Typography align="right" sx={{ color: color }}>
            {"exp"}
          </Typography>
        </TableCell>
      </>
    );
  }

  return (
    <>
      <span>
        <Table sx={{ style: "flex", display: "table", width: "100%", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
          <TableBody>
            <Tooltip
              title={
                <Typography>
                  Hk: x{formatMultiplier(props.member.hack_mult * asc.hack)}(x
                  {formatMultiplier(props.member.hack_mult)} Eq, x{formatMultiplier(asc.hack)} Asc)
                </Typography>
              }
            >
              <TableRow>
                {exportStat("Hacking", props.member.hack, props.member.hack_exp, Settings.theme.hack)}
              </TableRow>
            </Tooltip>

            <Tooltip
              title={
                <Typography>
                  St: x{formatMultiplier(props.member.str_mult * asc.str)}
                  (x{formatMultiplier(props.member.str_mult)} Eq, x{formatMultiplier(asc.str)} Asc)
                </Typography>
              }
            >
              <TableRow>
                {exportStat("Strength", props.member.str, props.member.str_exp, Settings.theme.combat)}
              </TableRow>
            </Tooltip>

            <Tooltip
              title={
                <Typography>
                  Df: x{formatMultiplier(props.member.def_mult * asc.def)}
                  (x{formatMultiplier(props.member.def_mult)} Eq, x{formatMultiplier(asc.def)} Asc)
                </Typography>
              }
            >
              <TableRow>
                {exportStat("Defence", props.member.def, props.member.def_exp, Settings.theme.combat)}
              </TableRow>
            </Tooltip>

            <Tooltip
              title={
                <Typography>
                  Dx: x{formatMultiplier(props.member.dex_mult * asc.dex)}
                  (x{formatMultiplier(props.member.dex_mult)} Eq, x{formatMultiplier(asc.dex)} Asc)
                </Typography>
              }
            >
              <TableRow>
                {exportStat("Dexterity", props.member.dex, props.member.dex_exp, Settings.theme.combat)}
              </TableRow>
            </Tooltip>

            <Tooltip
              title={
                <Typography>
                  Ag: x{formatMultiplier(props.member.agi_mult * asc.agi)}
                  (x{formatMultiplier(props.member.agi_mult)} Eq, x{formatMultiplier(asc.agi)} Asc)
                </Typography>
              }
            >
              <TableRow>
                {exportStat("Agility", props.member.agi, props.member.agi_exp, Settings.theme.combat)}
              </TableRow>
            </Tooltip>

            <Tooltip
              title={
                <Typography>
                  Ch: x{formatMultiplier(props.member.cha_mult * asc.cha)}
                  (x{formatMultiplier(props.member.cha_mult)} Eq, x{formatMultiplier(asc.cha)} Asc)
                </Typography>
              }
            >
              <TableRow>{exportStat("Charisma", props.member.cha, props.member.cha_exp, Settings.theme.cha)}</TableRow>
            </Tooltip>
          </TableBody>
        </Table>
        <Table sx={{ style: "flex", display: "table", width: "100%", gridTemplateColumns: "1fr 1fr" }}>
          {data.map(([a, b]) => (
            <TableRow key={a.toString() + b.toString()}>
              <TableCell classes={{ root: classes.cellNone }}>
                <Typography>{a}</Typography>
              </TableCell>
              <TableCell align="right" classes={{ root: classes.cellNone }}>
                <Typography>{b}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </span>
    </>
  );
}
