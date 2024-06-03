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
import { useRerender } from "./React/hooks";

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
        name="Hacking Exp"
        color={Settings.theme.hack}
        data={{
          content: `${formatExp(rate.hackExp * CYCLES_PER_SEC)} / sec`,
        }}
      />
    ),
    rate.strExp > 0 && (
      <StatsRow
        key="str"
        name="Strength Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.strExp * CYCLES_PER_SEC)} / sec`,
        }}
      />
    ),
    rate.defExp > 0 && (
      <StatsRow
        key="def"
        name="Defense Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.defExp * CYCLES_PER_SEC)} / sec`,
        }}
      />
    ),
    rate.dexExp > 0 && (
      <StatsRow
        key="dex"
        name="Dexterity Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.dexExp * CYCLES_PER_SEC)} / sec`,
        }}
      />
    ),
    rate.agiExp > 0 && (
      <StatsRow
        key="agi"
        name="Agility Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.agiExp * CYCLES_PER_SEC)} / sec`,
        }}
      />
    ),
    rate.chaExp > 0 && (
      <StatsRow
        key="cha"
        name="Charisma Exp"
        color={Settings.theme.cha}
        data={{
          content: `${formatExp(rate.chaExp * CYCLES_PER_SEC)} / sec`,
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
        name="Hacking Exp"
        color={Settings.theme.hack}
        data={{
          content: `${formatExp(rate.hackExp)}`,
        }}
      />
    ),
    rate.strExp > 0 && (
      <StatsRow
        key="str"
        name="Strength Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.strExp)}`,
        }}
      />
    ),
    rate.defExp > 0 && (
      <StatsRow
        key="def"
        name="Defense Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.defExp)}`,
        }}
      />
    ),
    rate.dexExp > 0 && (
      <StatsRow
        key="dex"
        name="Dexterity Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.dexExp)}`,
        }}
      />
    ),
    rate.agiExp > 0 && (
      <StatsRow
        key="agi"
        name="Agility Exp"
        color={Settings.theme.combat}
        data={{
          content: `${formatExp(rate.agiExp)}`,
        }}
      />
    ),
    rate.chaExp > 0 && (
      <StatsRow
        key="cha"
        name="Charisma Exp"
        color={Settings.theme.cha}
        data={{
          content: `${formatExp(rate.chaExp)}`,
        }}
      />
    ),
  ]);
}

export function WorkInProgressRoot(): React.ReactElement {
  useRerender(CONSTANTS.MilliPerCycle);

  let workInfo: IWorkInfo = {
    buttons: {
      cancel: () => undefined,
    },
    title: "",
    stopText: "",
  };

  if (Player.currentWork === null) {
    setTimeout(() => Router.toPage(Page.Terminal));
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
          Player.stopFocusing();
        },
      },
      title: `You are attempting ${crime.workName}`,

      gains: [
        <tr key="header">
          <td>
            <Typography>Success chance: {formatPercent(successChance)}</Typography>
            <Typography>Gains (on success)</Typography>
          </td>
        </tr>,
        <StatsRow key="money" name="Money:" color={Settings.theme.money}>
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

      stopText: "Stop committing crime",
    };
  }

  if (isClassWork(Player.currentWork)) {
    const classWork = Player.currentWork;

    let stopText = "";
    if (classWork.isGym()) {
      stopText = "Stop training at gym";
    } else {
      stopText = "Stop taking course";
    }

    const rates = classWork.calculateRates();
    workInfo = {
      buttons: {
        cancel: () => {
          Player.finishWork(true);
          Router.toPage(Page.City);
        },
        unfocus: () => {
          Router.toPage(Page.City);
          Player.stopFocusing();
        },
      },
      title: (
        <>
          You are currently <b>{classWork.getClass().youAreCurrently}</b>
        </>
      ),

      gains: [
        <StatsRow key="totalCost" name="Total Cost" color={Settings.theme.money}>
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
          Player.stopFocusing();
        },
      },
      title: (
        <>
          You are currently working on coding <b>{create.programName}</b>
        </>
      ),

      progress: {
        remaining: remainingTime,
        percentage: completion,
      },

      stopText: "Stop creating program",
      stopTooltip: "Your work will be saved and you can return to complete the program later.",
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
          Player.stopFocusing();
        },
      },
      title: (
        <>
          You are currently working on grafting <b>{graftWork.augmentation}</b>
        </>
      ),

      progress: {
        remaining: remainingTime,
        percentage: (graftWork.unitCompleted / graftWork.unitNeeded()) * 100,
      },

      stopText: "Stop grafting",
      stopTooltip: (
        <>
          If you cancel, your work will <b>not</b> be saved, and the money you spent will <b>not</b> be returned
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
          `You have not joined ${Player.currentWork.factionName || "(Faction not found)"} at this time,` +
          " please try again if you think this should have worked",

        stopText: "Back to Factions",
      };
    }

    const description = {
      [FactionWorkType.hacking]: "carrying out hacking contracts",
      [FactionWorkType.field]: "carrying out field missions",
      [FactionWorkType.security]: "performing security detail",
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
          Player.stopFocusing();
        },
      },
      title: (
        <>
          You are currently {description[Player.currentWork.factionWorkType]} for <b>{faction.name}</b>
        </>
      ),

      description: (
        <>
          Current Faction Reputation: <Reputation reputation={faction.playerReputation} /> (
          <ReputationRate reputation={Player.currentWork.getReputationRate() * CYCLES_PER_SEC} />)
        </>
      ),
      gains: ExpRows(exp),
      progress: {
        elapsed: Player.currentWork.cyclesWorked * CONSTANTS.MilliPerCycle,
      },

      stopText: "Stop Faction work",
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
          `You cannot work for ${Player.currentWork.companyName} at this time,` +
          " please try again if you think this should have worked",

        stopText: "Back to Terminal",
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
          Router.toPage(Page.Job, { location: Locations[comp.name] });
        },
        unfocus: () => {
          Player.stopFocusing();
          Router.toPage(Page.Job, { location: Locations[comp.name] });
        },
      },
      title: (
        <>
          You are currently working as a <b>{position}</b> at <b>{Player.currentWork.companyName}</b>
        </>
      ),

      description: (
        <>
          Current Company Reputation: <Reputation reputation={companyRep} />
        </>
      ),
      gains: [
        <StatsRow key="money" name="Money" color={Settings.theme.money}>
          <Typography>
            <MoneyRate money={gains.money * CYCLES_PER_SEC} />
          </Typography>
        </StatsRow>,
        <StatsRow key="reputation" name="Company Reputation" color={Settings.theme.rep}>
          <Typography>
            <ReputationRate reputation={gains.reputation * CYCLES_PER_SEC} />
          </Typography>
        </StatsRow>,
        ...ExpRows(gains),
      ],
      progress: {
        elapsed: Player.currentWork.cyclesWorked * CONSTANTS.MilliPerCycle,
      },

      stopText: "Stop working",
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
                <Typography>{convertTimeMsToTimeElapsedString(workInfo.progress.elapsed)} elapsed</Typography>
              )}
              {workInfo.progress.remaining !== undefined && (
                <Typography>{convertTimeMsToTimeElapsedString(workInfo.progress.remaining)} remaining</Typography>
              )}
              {workInfo.progress.percentage !== undefined && (
                <Typography>{workInfo.progress.percentage.toFixed(2)}% done</Typography>
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
            <Button onClick={workInfo.buttons.unfocus}>Do something else simultaneously</Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
