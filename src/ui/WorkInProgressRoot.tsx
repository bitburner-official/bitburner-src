import React from "react";
import { Box, Button, Container, Paper, Table, TableBody, Tooltip, Typography } from "@mui/material";

import { Player } from "@player";
import { FactionWorkType, LocationName } from "@enums";

import { Money } from "./React/Money";
import { MoneyRate } from "./React/MoneyRate";
import { ProgressBar } from "./React/Progress";
import { Reputation } from "./React/Reputation";
import { ReputationRate } from "./React/ReputationRate";
import { StatsRow } from "./React/StatsRow";
import { useCycleRerender } from "./React/hooks";

import { Companies } from "../Company/Companies";
import { CONSTANTS } from "../Constants";
import { Locations } from "../Locations/Locations";
import { Settings } from "../Settings/Settings";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { filterTruthy } from "../utils/helpers/ArrayHelpers";

import { isCrimeWork } from "../Work/CrimeWork";
import { isClassWork } from "../Work/ClassWork";
import { WorkStats } from "../Work/WorkStats";
import { isCreateProgramWork } from "../Work/CreateProgramWork";
import { isGraftingWork } from "../Work/GraftingWork";
import { isFactionWork } from "../Work/FactionWork";
import { isCompanyWork } from "../Work/CompanyWork";
import { Router } from "./GameRoot";
import { Page } from "./Router";
import { formatExp, formatPercent } from "./formatNumber";

const CYCLES_PER_SEC = 1000 / CONSTANTS.MilliPerCycle;

interface IWorkInfo {
  buttons: {
    cancel: () => void;
    unfocus?: () => void;
  };
  title: string | React.ReactElement;

  description?: string | React.ReactElement;
  gains?: React.ReactElement[];
  progress?: {
    elapsed?: number;
    remaining?: number;
    percentage?: number;
  };

  stopText: string;
  stopTooltip?: string | React.ReactElement;
}

function ExpRows(rate: WorkStats): React.ReactElement[] {
  return filterTruthy([
    rate.hackExp > 0 && (
      <StatsRow
        key="hack"
        name="黑客经验"
        color={Settings.theme.hack}
        data={{
          content: `${formatExp(rate.hackExp * CYCLES_PER_SEC)} / 秒`,
        }}
      />
    ),
    rate.strExp > 0 && (
      <StatsRow
        key="str"
        name="力量经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.strExp * CYCLES_PER_SEC)} / 秒`,
        }}
      />
    ),
    rate.defExp > 0 && (
      <StatsRow
        key="def"
        name="防御经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.defExp * CYCLES_PER_SEC)} / 秒`,
        }}
      />
    ),
    rate.dexExp > 0 && (
      <StatsRow
        key="dex"
        name="灵巧经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.dexExp * CYCLES_PER_SEC)} / 秒`,
        }}
      />
    ),
    rate.agiExp > 0 && (
      <StatsRow
        key="agi"
        name="敏捷经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.agiExp * CYCLES_PER_SEC)} / 秒`,
        }}
      />
    ),
    rate.chaExp > 0 && (
      <StatsRow
        key="cha"
        name="魅力经验"
        color={Settings.theme.cha}
        data={{
          content: `${formatExp(rate.chaExp * CYCLES_PER_SEC)} / 秒`,
        }}
      />
    ),
  ]);
}

/* Because crime exp is given all at once at the end, we don't care about the cycles per second. */
function CrimeExpRows(rate: WorkStats): React.ReactElement[] {
  return filterTruthy([
    rate.hackExp > 0 && (
      <StatsRow
        key="hack"
        name="黑客经验"
        color={Settings.theme.hack}
        data={{
          content: `${formatExp(rate.hackExp)}`,
        }}
      />
    ),
    rate.strExp > 0 && (
      <StatsRow
        key="str"
        name="力量经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.strExp)}`,
        }}
      />
    ),
    rate.defExp > 0 && (
      <StatsRow
        key="def"
        name="防御经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.defExp)}`,
        }}
      />
    ),
    rate.dexExp > 0 && (
      <StatsRow
        key="dex"
        name="灵巧经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.dexExp)}`,
        }}
      />
    ),
    rate.agiExp > 0 && (
      <StatsRow
        key="agi"
        name="敏捷经验"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.agiExp)}`,
        }}
      />
    ),
    rate.chaExp > 0 && (
      <StatsRow
        key="cha"
        name="魅力经验"
        color={Settings.theme.cha}
        data={{
          content: `${formatExp(rate.chaExp)}`,
        }}
      />
    ),
  ]);
}

export function WorkInProgressRoot(): React.ReactElement {
  useCycleRerender();

  let workInfo: IWorkInfo = {
    buttons: {
      cancel: () => undefined,
    },
    title: "",
    stopText: "",
  };

  if (Player.currentWork === null) {
    setTimeout(() => {
      /**
       * We must check again before routing to the Terminal page. The player might have started an action right before
       * the callback of setTimeout is called.
       */
      if (Player.currentWork === null) {
        Router.toPage(Page.Terminal);
      }
    });
    return <></>;
  }

  if (isCrimeWork(Player.currentWork)) {
    const crime = Player.currentWork.getCrime();
    const completion = (Player.currentWork.unitCompleted / crime.time) * 100;
    const gains = Player.currentWork.earnings();
    const successChance = crime.successRate(Player);
    workInfo = {
      buttons: {
        cancel: () => {
          Router.toPage(Page.Location, { location: Locations[LocationName.Slums] });
          Player.finishWork(true);
        },
        unfocus: () => {
          Router.toPage(Page.City);
        },
      },
      title: `你正在尝试${crime.workName}`,

      gains: [
        <tr key="header">
          <td>
            <Typography>成功率：{formatPercent(successChance)}</Typography>
            <Typography>收益（成功时）</Typography>
          </td>
        </tr>,
        <StatsRow key="money" name="资金：" color={Settings.theme.money}>
          <Typography>
            <Money money={gains.money} />
          </Typography>
        </StatsRow>,
        ...CrimeExpRows(gains),
      ],
      progress: {
        remaining: crime.time - Player.currentWork.unitCompleted,
        percentage: completion,
      },

      stopText: "停止犯罪",
    };
  }

  if (isClassWork(Player.currentWork)) {
    const classWork = Player.currentWork;

    let stopText = "";
    if (classWork.isGym()) {
      stopText = "停止在健身房训练";
    } else {
      stopText = "停止上课";
    }

    const rates = classWork.calculateRates();
    workInfo = {
      buttons: {
        cancel: () => {
          Player.finishWork(true);
          Router.toPage(Page.Location, { location: Locations[classWork.location] });
        },
        unfocus: () => {
          Router.toPage(Page.Location, { location: Locations[classWork.location] });
        },
      },
      title: (
        <>
          你目前正在进行 <b>{classWork.getClass().youAreCurrently}</b>
        </>
      ),

      gains: [
        <StatsRow key="totalCost" name="总花费" color={Settings.theme.money}>
          <Typography>
            <Money money={classWork.earnings.money} /> (<MoneyRate money={rates.money * CYCLES_PER_SEC} />)
          </Typography>
        </StatsRow>,
        ...ExpRows(rates),
      ],
      progress: {
        elapsed: classWork.cyclesWorked * CONSTANTS.MilliPerCycle,
      },

      stopText: stopText,
    };
  }

  if (isCreateProgramWork(Player.currentWork)) {
    const create = Player.currentWork;
    const completion = (create.unitCompleted / create.unitNeeded()) * 100;
    const remainingTime = ((create.unitNeeded() - create.unitCompleted) / create.unitRate) * CONSTANTS.MilliPerCycle;
    workInfo = {
      buttons: {
        cancel: () => {
          Player.finishWork(true);
          Router.toPage(Page.Terminal);
        },
        unfocus: () => {
          Router.toPage(Page.Terminal);
        },
      },
      title: (
        <>
          你目前正在编写程序 <b>{create.programName}</b>
        </>
      ),

      progress: {
        remaining: remainingTime,
        percentage: completion,
      },

      stopText: "停止编写程序",
      stopTooltip: "你的进度会被保存，之后可以回来继续完成该程序。",
    };
  }

  if (isGraftingWork(Player.currentWork)) {
    const graftWork = Player.currentWork;
    const remainingTime =
      ((graftWork.unitNeeded() - graftWork.unitCompleted) / graftWork.unitRate) * CONSTANTS.MilliPerCycle;
    workInfo = {
      buttons: {
        cancel: () => {
          Player.finishWork(true);
          Router.toPage(Page.Terminal);
        },
        unfocus: () => {
          Router.toPage(Page.Terminal);
        },
      },
      title: (
        <>
          你目前正在为 <b>{graftWork.augmentation}</b> 进行移植
        </>
      ),

      progress: {
        remaining: remainingTime,
        percentage: (graftWork.unitCompleted / graftWork.unitNeeded()) * 100,
      },

      stopText: "停止移植",
      stopTooltip: (
        <>
          如果取消，你的进度将<b>不会</b>被保存，已花费的资金也<b>不会</b>退还
        </>
      ),
    };
  }

  if (isFactionWork(Player.currentWork)) {
    const faction = Player.currentWork.getFaction();
    if (!faction) {
      workInfo = {
        buttons: {
          cancel: () => Router.toPage(Page.Factions),
        },
        title:
          `你当前尚未加入 ${Player.currentWork.factionName || "(未找到该派系)"}，` +
          "如果你认为这不应发生，请重试",

        stopText: "返回派系列表",
      };
    }

    const description = {
      [FactionWorkType.hacking]: "执行黑客合同",
      [FactionWorkType.field]: "执行外勤任务",
      [FactionWorkType.security]: "执行安保任务",
    };

    const exp = Player.currentWork.getExpRates();

    workInfo = {
      buttons: {
        cancel: () => {
          Router.toPage(Page.Faction, { faction });
          Player.finishWork(true);
        },
        unfocus: () => {
          Router.toPage(Page.Faction, { faction });
        },
      },
      title: (
        <>
          你目前正在为 <b>{faction.name}</b> {description[Player.currentWork.factionWorkType]}
        </>
      ),

      description: (
        <>
          当前派系声望：<Reputation reputation={faction.playerReputation} />（
          <ReputationRate reputation={Player.currentWork.getReputationRate() * CYCLES_PER_SEC} />）
        </>
      ),
      gains: ExpRows(exp),
      progress: {
        elapsed: Player.currentWork.cyclesWorked * CONSTANTS.MilliPerCycle,
      },

      stopText: "停止派系工作",
    };
  }

  if (isCompanyWork(Player.currentWork)) {
    const comp = Companies[Player.currentWork.companyName];
    if (comp) {
      workInfo = {
        buttons: {
          cancel: () => Router.toPage(Page.Terminal),
        },
        title:
          `你当前无法为 ${Player.currentWork.companyName} 工作，` +
          "如果你认为这不应发生，请重试",

        stopText: "返回终端",
      };
    }

    const companyRep = comp.playerReputation;

    const position = Player.jobs[Player.currentWork.companyName];
    if (!position) return <></>;
    const gains = Player.currentWork.getGainRates(position);
    workInfo = {
      buttons: {
        cancel: () => {
          Player.finishWork(true);
          Router.toPage(Page.Job);
        },
        unfocus: () => {
          Router.toPage(Page.Job);
        },
      },
      title: (
        <>
          你目前在 <b>{Player.currentWork.companyName}</b> 担任 <b>{position}</b>
        </>
      ),

      description: (
        <>
          当前公司声望：<Reputation reputation={companyRep} />
        </>
      ),
      gains: [
        <StatsRow key="money" name="资金" color={Settings.theme.money}>
          <Typography>
            <MoneyRate money={gains.money * CYCLES_PER_SEC} />
          </Typography>
        </StatsRow>,
        <StatsRow key="reputation" name="公司声望" color={Settings.theme.rep}>
          <Typography>
            <ReputationRate reputation={gains.reputation * CYCLES_PER_SEC} />
          </Typography>
        </StatsRow>,
        ...ExpRows(gains),
      ],
      progress: {
        elapsed: Player.currentWork.cyclesWorked * CONSTANTS.MilliPerCycle,
      },

      stopText: "停止工作",
    };
  }

  if (workInfo.title === "") {
    return <></>;
  }

  const tooltipInfo =
    typeof workInfo.stopTooltip === "string" ? (
      <Typography>{workInfo.stopTooltip}</Typography>
    ) : (
      workInfo.stopTooltip || <></>
    );

  return (
    <Container
      maxWidth="md"
      sx={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "calc(100vh - 16px)" }}
    >
      <Paper sx={{ p: 1, mb: 1 }}>
        <Typography variant="h6">{workInfo.title}</Typography>
        <Typography>{workInfo.description}</Typography>
        {workInfo.gains && (
          <Table sx={{ mt: 1 }}>
            <TableBody>{workInfo.gains}</TableBody>
          </Table>
        )}
      </Paper>
      <Paper sx={{ mb: 1, p: 1 }}>
        {workInfo.progress !== undefined && (
          <Box sx={{ mb: 1 }}>
            <Box
              display="grid"
              sx={{
                gridTemplateColumns: `repeat(${Object.keys(workInfo.progress).length}, 1fr)`,
                width: "100%",
                justifyItems: "center",
                textAlign: "center",
              }}
            >
              {workInfo.progress.elapsed !== undefined && (
                <Typography>已进行 {convertTimeMsToTimeElapsedString(workInfo.progress.elapsed)}</Typography>
              )}
              {workInfo.progress.remaining !== undefined && (
                <Typography>剩余 {convertTimeMsToTimeElapsedString(workInfo.progress.remaining)}</Typography>
              )}
              {workInfo.progress.percentage !== undefined && (
                <Typography>已完成 {workInfo.progress.percentage.toFixed(2)}%</Typography>
              )}
            </Box>
            {workInfo.progress.percentage !== undefined && (
              <ProgressBar variant="determinate" value={workInfo.progress.percentage} color="primary" />
            )}
          </Box>
        )}

        <Box display="grid" sx={{ gridTemplateColumns: `repeat(${Object.keys(workInfo.buttons).length}, 1fr)` }}>
          {workInfo.stopTooltip ? (
            <Tooltip title={tooltipInfo}>
              <Button onClick={workInfo.buttons.cancel}>{workInfo.stopText}</Button>
            </Tooltip>
          ) : (
            <Button onClick={workInfo.buttons.cancel}>{workInfo.stopText}</Button>
          )}
          {workInfo.buttons.unfocus && (
            <Button onClick={workInfo.buttons.unfocus}>同时进行其他活动</Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
