import React from "react";

import { Typography, Table, TableBody, TableCell, TableRow } from "@mui/material";

import { Player } from "@player";

import { CONSTANTS } from "../../../Constants";

import {
  formatExp,
  formatHp,
  formatSleeveMemory,
  formatSleeveShock,
  formatSleeveSynchro,
} from "../../../ui/formatNumber";
import { Settings } from "../../../Settings/Settings";
import { StatsRow } from "../../../ui/React/StatsRow";
import { useStyles } from "../../../ui/React/CharacterOverview";
import { Money } from "../../../ui/React/Money";
import { MoneyRate } from "../../../ui/React/MoneyRate";
import { ReputationRate } from "../../../ui/React/ReputationRate";

import { Sleeve } from "../Sleeve";
import { isSleeveClassWork } from "../Work/SleeveClassWork";
import { isSleeveFactionWork } from "../Work/SleeveFactionWork";
import { isSleeveCompanyWork } from "../Work/SleeveCompanyWork";
import { isSleeveCrimeWork } from "../Work/SleeveCrimeWork";
import { getKeyFromReactElements } from "../../../utils/StringHelperFunctions";

const CYCLES_PER_SEC = 1000 / CONSTANTS.MilliPerCycle;

interface IProps {
  sleeve: Sleeve;
}

export function StatsElement(props: IProps): React.ReactElement {
  const { classes } = useStyles();

  return (
    <Table sx={{ display: "table", mb: 1, width: "100%" }}>
      <TableBody>
        <StatsRow name="城市" color={Settings.theme.primary} data={{ content: props.sleeve.city }} />
        <StatsRow
          name="HP"
          color={Settings.theme.hp}
          data={{
            content: `${formatHp(props.sleeve.hp.current)} / ${formatHp(props.sleeve.hp.max)}`,
          }}
        />
        <StatsRow
          name="黑客"
          color={Settings.theme.hack}
          data={{ level: props.sleeve.skills.hacking, exp: props.sleeve.exp.hacking }}
        />
        <StatsRow
          name="力量"
          color={Settings.theme.combat}
          data={{ level: props.sleeve.skills.strength, exp: props.sleeve.exp.strength }}
        />
        <StatsRow
          name="防御"
          color={Settings.theme.combat}
          data={{ level: props.sleeve.skills.defense, exp: props.sleeve.exp.defense }}
        />
        <StatsRow
          name="灵巧"
          color={Settings.theme.combat}
          data={{ level: props.sleeve.skills.dexterity, exp: props.sleeve.exp.dexterity }}
        />
        <StatsRow
          name="敏捷"
          color={Settings.theme.combat}
          data={{ level: props.sleeve.skills.agility, exp: props.sleeve.exp.agility }}
        />
        <StatsRow
          name="魅力"
          color={Settings.theme.cha}
          data={{ level: props.sleeve.skills.charisma, exp: props.sleeve.exp.charisma }}
        />
        {props.sleeve.skills.intelligence > 0 && (
          <StatsRow
            name="智力"
            color={Settings.theme.int}
            data={{ level: props.sleeve.skills.intelligence, exp: props.sleeve.exp.intelligence }}
          />
        )}
        <TableRow>
          <TableCell classes={{ root: classes.cellNone }}>
            <br />
          </TableCell>
        </TableRow>
        <StatsRow
          name="震荡"
          color={Settings.theme.primary}
          data={{ content: formatSleeveShock(props.sleeve.shock) }}
        />
        <StatsRow
          name="同步"
          color={Settings.theme.primary}
          data={{ content: formatSleeveSynchro(props.sleeve.sync) }}
        />
        <StatsRow
          name="记忆"
          color={Settings.theme.primary}
          data={{ content: formatSleeveMemory(props.sleeve.memory) }}
        />
      </TableBody>
    </Table>
  );
}

export function EarningsElement(props: IProps): React.ReactElement {
  const { classes } = useStyles();

  let data: [string, string | JSX.Element][] = [];
  if (isSleeveCrimeWork(props.sleeve.currentWork)) {
    const gains = props.sleeve.currentWork.getExp(props.sleeve);
    data = [
      [`资金：`, <Money key="money" money={gains.money} />],
      [`黑客经验：`, `${formatExp(gains.hackExp)}`],
      [`力量经验：`, `${formatExp(gains.strExp)}`],
      [`防御经验：`, `${formatExp(gains.defExp)}`],
      [`灵巧经验：`, `${formatExp(gains.dexExp)}`],
      [`敏捷经验：`, `${formatExp(gains.agiExp)}`],
      [`魅力经验：`, `${formatExp(gains.chaExp)}`],
    ];
  }
  if (isSleeveClassWork(props.sleeve.currentWork)) {
    const rates = props.sleeve.currentWork.calculateRates(props.sleeve);
    data = [
      [`资金：`, <MoneyRate key="money-rate" money={CYCLES_PER_SEC * rates.money} />],
      [`黑客经验：`, `${formatExp(CYCLES_PER_SEC * rates.hackExp)} / 秒`],
      [`力量经验：`, `${formatExp(CYCLES_PER_SEC * rates.strExp)} / 秒`],
      [`防御经验：`, `${formatExp(CYCLES_PER_SEC * rates.defExp)} / 秒`],
      [`灵巧经验：`, `${formatExp(CYCLES_PER_SEC * rates.dexExp)} / 秒`],
      [`敏捷经验：`, `${formatExp(CYCLES_PER_SEC * rates.agiExp)} / 秒`],
      [`魅力经验：`, `${formatExp(CYCLES_PER_SEC * rates.chaExp)} / 秒`],
    ];
  }
  if (isSleeveFactionWork(props.sleeve.currentWork)) {
    const rates = props.sleeve.currentWork.getExpRates(props.sleeve);
    const repGain = props.sleeve.currentWork.getReputationRate(props.sleeve);
    data = [
      [`黑客经验：`, `${formatExp(CYCLES_PER_SEC * rates.hackExp)} / 秒`],
      [`力量经验：`, `${formatExp(CYCLES_PER_SEC * rates.strExp)} / 秒`],
      [`防御经验：`, `${formatExp(CYCLES_PER_SEC * rates.defExp)} / 秒`],
      [`灵巧经验：`, `${formatExp(CYCLES_PER_SEC * rates.dexExp)} / 秒`],
      [`敏捷经验：`, `${formatExp(CYCLES_PER_SEC * rates.agiExp)} / 秒`],
      [`魅力经验：`, `${formatExp(CYCLES_PER_SEC * rates.chaExp)} / 秒`],
      [`声望：`, <ReputationRate key="reputation-rate" reputation={CYCLES_PER_SEC * repGain} />],
    ];
  }

  if (isSleeveCompanyWork(props.sleeve.currentWork)) {
    const job = Player.jobs[props.sleeve.currentWork.companyName];
    if (job) {
      const rates = props.sleeve.currentWork.getGainRates(props.sleeve, job);
      data = [
        [`资金：`, <MoneyRate key="money-rate" money={CYCLES_PER_SEC * rates.money} />],
        [`黑客经验：`, `${formatExp(CYCLES_PER_SEC * rates.hackExp)} / 秒`],
        [`力量经验：`, `${formatExp(CYCLES_PER_SEC * rates.strExp)} / 秒`],
        [`防御经验：`, `${formatExp(CYCLES_PER_SEC * rates.defExp)} / 秒`],
        [`灵巧经验：`, `${formatExp(CYCLES_PER_SEC * rates.dexExp)} / 秒`],
        [`敏捷经验：`, `${formatExp(CYCLES_PER_SEC * rates.agiExp)} / 秒`],
        [`魅力经验：`, `${formatExp(CYCLES_PER_SEC * rates.chaExp)} / 秒`],
        [`声望：`, <ReputationRate key="reputation-rate" reputation={CYCLES_PER_SEC * rates.reputation} />],
      ];
    }
  }

  return (
    <Table sx={{ display: "table", mb: 1, width: "100%", lineHeight: 0 }}>
      <TableBody>
        <TableRow>
          <TableCell classes={{ root: classes.cellNone }}>
            <Typography variant="h6">
              收益 {props.sleeve.storedCycles > 50 ? "（由奖励时间加速）" : ""}
            </Typography>
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
  );
}
