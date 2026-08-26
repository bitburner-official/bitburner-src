import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BladeburnerActionType, FactionWorkType, GymType, SpecialBladeburnerActionTypeForSleeve } from "@enums";
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
import { type SleeveWork, SleeveWorkType } from "../Work/Work";
import { getEnumHelper } from "../../../utils/EnumHelper";
import { getRecordEntries } from "../../../Types/Record";

const factionWorkTypeDescriptions = {
  [FactionWorkType.field]: "外勤工作",
  [FactionWorkType.hacking]: "黑客合同",
  [FactionWorkType.security]: "安保工作",
};

const gymTypeDescriptions: Record<GymType, string> = {
  [GymType.strength]: "训练力量",
  [GymType.defense]: "训练防御",
  [GymType.dexterity]: "训练灵巧",
  [GymType.agility]: "训练敏捷",
};

function getWorkDescription(sleeve: Sleeve, progress: number): string {
  const work = sleeve.currentWork;
  if (!work) return "该分身目前处于空闲状态。";
  switch (work.type) {
    case SleeveWorkType.COMPANY:
      return `该分身目前正在为${work.companyName}工作`;
    case SleeveWorkType.SUPPORT:
      return "该分身目前在你的 Bladeburner 活动中为你提供支援。";
    case SleeveWorkType.CLASS:
      return `该分身目前正在${work.location}${work.isGym() ? "健身" : "上课"}`;
    case SleeveWorkType.RECOVERY:
      return "该分身当前被设置为专注震荡恢复。这会使分身的震荡以更快的速度消退。";
    case SleeveWorkType.SYNCHRO:
      return "该分身当前被设置为与本体意识同步。这会使分身的同步率上升。";
    case SleeveWorkType.BLADEBURNER: {
      const bladeburner = Player.bladeburner;
      let estimatedSuccessChance;
      if (bladeburner) {
        const action = bladeburner.getActionFromTypeAndName(work.actionId.type, work.actionId.name);
        if (action) {
          const [minChance, maxChance] = action.getSuccessRange(bladeburner, sleeve);
          estimatedSuccessChance =
            formatPercent(minChance, 1) + (minChance === maxChance ? "" : ` ~ ${formatPercent(maxChance, 1)}`);
        }
      }
      return (
        `该分身目前正尝试执行 ${work.actionId.name}。\n\n` +
        (estimatedSuccessChance ? `预估成功率：${estimatedSuccessChance}\n\n` : "") +
        `已完成任务数：${formatInt(work.tasksCompleted)}\n \n` +
        `进度：${formatPercent(progress)}`
      );
    }
    case SleeveWorkType.CRIME: {
      const crime = work.getCrime();
      return (
        `该分身目前正在尝试${crime.workName}（成功率：${formatPercent(
          crime.successRate(sleeve),
        )}）。\n\n已完成任务数：${formatInt(work.tasksCompleted)} 
		\n` + `进度：${formatPercent(progress)}`
      );
    }
    case SleeveWorkType.FACTION: {
      return `该分身目前正在为${work.factionName}执行${
        factionWorkTypeDescriptions[work.factionWorkType]
      }。`;
    }
    case SleeveWorkType.INFILTRATE:
      return (
        "该分身目前正尝试潜入合成人社区，以生成额外的合同和行动。\n被指派执行此活动的分身越多，效率越低。\n\n" +
        `进度：${formatPercent(progress)}`
      );
  }
}

function calculateABC(work: SleeveWork | null): [string, string, string] {
  if (work === null) {
    return ["Idle", "------", "------"];
  }
  switch (work.type) {
    case SleeveWorkType.COMPANY:
      return ["Work for Company", work.companyName, "------"];
    case SleeveWorkType.FACTION: {
      return ["Work for Faction", work.factionName, factionWorkTypeDescriptions[work.factionWorkType]];
    }
    case SleeveWorkType.BLADEBURNER:
      if (work.actionId.type === BladeburnerActionType.Contract) {
        return [
          "Perform Bladeburner Actions",
          SpecialBladeburnerActionTypeForSleeve.TakeOnContracts,
          work.actionId.name,
        ];
      }
      return ["Perform Bladeburner Actions", work.actionId.name, "------"];
    case SleeveWorkType.CLASS: {
      if (!work.isGym()) {
        return ["Take University Course", work.classType, work.location];
      }
      return ["Workout at Gym", gymTypeDescriptions[work.classType as GymType], work.location];
    }
    case SleeveWorkType.CRIME:
      return ["Commit Crime", getEnumHelper("CrimeType").getMember(work.crimeType, { alwaysMatch: true }), "------"];
    case SleeveWorkType.SUPPORT:
      return ["Perform Bladeburner Actions", SpecialBladeburnerActionTypeForSleeve.SupportMainSleeve, "------"];
    case SleeveWorkType.INFILTRATE:
      return ["Perform Bladeburner Actions", SpecialBladeburnerActionTypeForSleeve.InfiltrateSynthoids, "------"];
    case SleeveWorkType.RECOVERY:
      return ["Shock Recovery", "------", "------"];
    case SleeveWorkType.SYNCHRO:
      return ["Synchronize", "------", "------"];
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

  /**
   * "abc" contains values of 3 dropdown inputs. It will be set when:
   * - The player selects a task and its options.
   * - The sleeve's current task is set by non-UI things (e.g., NS API).
   */
  const [abc, setABC] = useState(calculateABC(props.sleeve.currentWork));

  /**
   * Update abc if the sleeve's current task is set by non-UI things.
   */
  useEffect(() => {
    setABC(calculateABC(props.sleeve.currentWork));
  }, [props.sleeve.currentWork]);

  function setTask(): void {
    switch (abc[0]) {
      case "Idle":
        props.sleeve.stopWork();
        break;
      case "Work for Company":
        if (getEnumHelper("CompanyName").isMember(abc[1])) {
          props.sleeve.workForCompany(abc[1]);
        } else {
          console.error(`Invalid company name in setSleeveTask: ${abc[1]}`);
        }
        break;
      case "Work for Faction":
        if (getEnumHelper("FactionName").isMember(abc[1])) {
          for (const [factionWorkType, description] of getRecordEntries(factionWorkTypeDescriptions)) {
            if (description === abc[2]) {
              props.sleeve.workForFaction(abc[1], factionWorkType);
              break;
            }
          }
        } else {
          console.error(`Invalid faction name in setSleeveTask: ${abc[1]}`);
        }
        break;
      case "Commit Crime":
        if (getEnumHelper("CrimeType").isMember(abc[1])) {
          props.sleeve.commitCrime(abc[1]);
        }
        break;
      case "Take University Course":
        if (getEnumHelper("UniversityClassType").isMember(abc[1])) {
          props.sleeve.takeUniversityCourse(abc[2], abc[1]);
        }
        break;
      case "Workout at Gym":
        for (const [gymType, description] of getRecordEntries(gymTypeDescriptions)) {
          if (description === abc[1]) {
            props.sleeve.workoutAtGym(abc[2], gymType);
            break;
          }
        }
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
  const checkingPreconditionsResult = props.sleeve.checkPreconditionsOfPurchasingAugmentations();
  return (
    <>
      <Paper sx={{ p: 1, display: "grid", gridTemplateColumns: "1fr 1fr", width: "auto", gap: 1 }}>
        <span>
          <StatsElement sleeve={props.sleeve} />
          <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", width: "100%" }}>
            <Button onClick={() => setStatsOpen(true)}>更多属性</Button>
            <Tooltip title={Player.money < CONSTANTS.TravelCost ? <Typography>资金不足</Typography> : ""}>
              <span>
                <Button
                  onClick={() => setTravelOpen(true)}
                  disabled={Player.money < CONSTANTS.TravelCost}
                  sx={{ width: "100%", height: "100%" }}
                >
                  旅行
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                !checkingPreconditionsResult.success && <Typography>{checkingPreconditionsResult.message}</Typography>
              }
            >
              <span>
                <Button
                  onClick={() => setAugmentationsOpen(true)}
                  disabled={!checkingPreconditionsResult.success}
                  sx={{ width: "100%", height: "100%" }}
                >
                  管理强化
                </Button>
              </span>
            </Tooltip>
          </Box>
        </span>
        <span>
          <EarningsElement sleeve={props.sleeve} />
          <TaskSelector sleeve={props.sleeve} abc={abc} setABC={setABC} />
          <Button onClick={setTask} sx={{ width: "100%" }}>
            设置任务
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
