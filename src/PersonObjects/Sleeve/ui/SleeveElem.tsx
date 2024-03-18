import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import { CrimeType, FactionWorkType } from "@enums";
import { CONSTANTS } from "../../../Constants";
import { Player } from "@player";
import { formatPercent, formatInt } from "../../../ui/formatNumber";
import { ProgressBar } from "../../../ui/React/Progress";
import { Sleeve } from "../Sleeve";
import { MoreStatsModal } from "./MoreStatsModal";
import { SleeveAugmentationsModal } from "./SleeveAugmentationsModal";
import { EarningsElement, StatsElement } from "./StatsElement";
import { TaskSelector } from "./TaskSelector";
import { TravelModal } from "./TravelModal";
import { findCrime } from "../../../Crime/CrimeHelpers";
import { SleeveWorkType } from "../Work/Work";
import { getEnumHelper } from "../../../utils/EnumHelper";

function getWorkDescription(sleeve: Sleeve, progress: number): string {
  const work = sleeve.currentWork;
  if (!work) return "This sleeve is currently idle.";
  switch (work.type) {
    case SleeveWorkType.COMPANY:
      return `This sleeve is currently working your job at ${work.companyName}`;
    case SleeveWorkType.SUPPORT:
      return "This sleeve is currently supporting you in your bladeburner activities.";
    case SleeveWorkType.CLASS:
      return `This sleeve is currently ${work.isGym() ? "working out" : "studying"} at ${work.location}`;
    case SleeveWorkType.RECOVERY:
      return "This sleeve is currently set to focus on shock recovery. This causes the Sleeve's shock to decrease at a faster rate.";
    case SleeveWorkType.SYNCHRO:
      return "This sleeve is currently set to synchronize with the original consciousness. This causes the Sleeve's synchronization to increase.";
    case SleeveWorkType.BLADEBURNER:
      return (
        `This sleeve is currently attempting to perform ${work.actionId.name}.\n\nTasks Completed: ${formatInt(
          work.tasksCompleted,
        )}\n \n` + `Progress: ${formatPercent(progress)}`
      );
    case SleeveWorkType.CRIME: {
      const crime = work.getCrime();
      return (
        `This sleeve is currently attempting ${crime.workName} (Success Rate: ${formatPercent(
          crime.successRate(sleeve),
        )}).\n\nTasks Completed: ${formatInt(work.tasksCompleted)} 
		\n` + `Progress: ${formatPercent(progress)}`
      );
    }
    case SleeveWorkType.FACTION: {
      // This isn't the way this should be handled...
      const workNames = {
        [FactionWorkType.field]: "Field Work",
        [FactionWorkType.hacking]: "Hacking Contracts",
        [FactionWorkType.security]: "Security Work",
      };
      const doing = workNames[work.factionWorkType] ?? "nothing";
      return `This sleeve is currently doing ${doing} for ${work.factionName}.`;
    }
    case SleeveWorkType.INFILTRATE:
      return (
        "This sleeve is currently attempting to infiltrate synthoid communities to generate additional contracts and operations.\nThis activity is less efficient the more sleeves are assigned to it.\n\n" +
        `Progress: ${formatPercent(progress)}`
      );
  }
}

interface SleeveElemProps {
  sleeve: Sleeve;
  rerender: () => void;
}
export function SleeveElem(props: SleeveElemProps): React.ReactElement {
  const [statsOpen, setStatsOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [augmentationsOpen, setAugmentationsOpen] = useState(false);

  const [abc, setABC] = useState(["Idle", "------", "------"]);

  function setTask(): void {
    switch (abc[0]) {
      case "Idle":
        props.sleeve.stopWork();
        break;
      case "Work for Company":
        if (getEnumHelper("CompanyName").isMember(abc[1])) props.sleeve.workForCompany(abc[1]);
        else console.error(`Invalid company name in setSleeveTask: ${abc[1]}`);
        break;
      case "Work for Faction":
        if (getEnumHelper("FactionName").isMember(abc[1])) props.sleeve.workForFaction(abc[1], abc[2]);
        else console.error(`Invalid faction name in setSleeveTask: ${abc[1]}`);
        break;
      case "Commit Crime":
        props.sleeve.commitCrime(findCrime(abc[1])?.type ?? CrimeType.shoplift);
        break;
      case "Take University Course":
        props.sleeve.takeUniversityCourse(abc[2], abc[1]);
        break;
      case "Workout at Gym":
        props.sleeve.workoutAtGym(abc[2], abc[1]);
        break;
      case "Perform Bladeburner Actions":
        props.sleeve.bladeburner(abc[1], abc[2]);
        break;
      case "Shock Recovery":
        props.sleeve.shockRecovery();
        break;
      case "Synchronize":
        props.sleeve.synchronize();
        break;
      default:
        console.error(`Invalid/Unrecognized taskValue in setSleeveTask(): ${abc[0]}`);
    }
    props.rerender();
  }
  let progress = 0;
  let percentBar = <></>;
  const work = props.sleeve.currentWork;
  if (work) {
    switch (work.type) {
      case SleeveWorkType.BLADEBURNER:
      case SleeveWorkType.CRIME:
      case SleeveWorkType.INFILTRATE:
        progress = work.cyclesWorked / work.cyclesNeeded(props.sleeve);
        percentBar = <ProgressBar variant="determinate" value={progress * 100} color="primary" />;
    }
  }
  const desc = getWorkDescription(props.sleeve, progress);
  return (
    <>
      <Paper sx={{ p: 1, display: "grid", gridTemplateColumns: "1fr 1fr", width: "auto", gap: 1 }}>
        <span>
          <StatsElement sleeve={props.sleeve} />
          <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", width: "100%" }}>
            <Button onClick={() => setStatsOpen(true)}>More Stats</Button>
            <Tooltip title={Player.money < CONSTANTS.TravelCost ? <Typography>Insufficient funds</Typography> : ""}>
              <span>
                <Button
                  onClick={() => setTravelOpen(true)}
                  disabled={Player.money < CONSTANTS.TravelCost}
                  sx={{ width: "100%", height: "100%" }}
                >
                  Travel
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={props.sleeve.shock > 0 ? <Typography>Unlocked when sleeve has fully recovered</Typography> : ""}
            >
              <span>
                <Button
                  onClick={() => setAugmentationsOpen(true)}
                  disabled={props.sleeve.shock > 0}
                  sx={{ width: "100%", height: "100%" }}
                >
                  Manage Augmentations
                </Button>
              </span>
            </Tooltip>
          </Box>
        </span>
        <span>
          <EarningsElement sleeve={props.sleeve} />
          <TaskSelector sleeve={props.sleeve} setABC={setABC} />
          <Button onClick={setTask} sx={{ width: "100%" }}>
            Set Task
          </Button>
          <Typography whiteSpace={"pre-wrap"}>{desc}</Typography>
          {percentBar}
        </span>
      </Paper>
      <MoreStatsModal open={statsOpen} onClose={() => setStatsOpen(false)} sleeve={props.sleeve} />
      <TravelModal
        open={travelOpen}
        onClose={() => setTravelOpen(false)}
        sleeve={props.sleeve}
        rerender={props.rerender}
      />
      <SleeveAugmentationsModal
        open={augmentationsOpen}
        onClose={() => setAugmentationsOpen(false)}
        sleeve={props.sleeve}
      />
    </>
  );
}
