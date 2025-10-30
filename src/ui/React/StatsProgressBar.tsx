import React, { useEffect, useMemo, useRef, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { TableRow, TableCell, Tooltip, Typography } from "@mui/material";
import { OverviewEventEmitter, useStyles } from "./CharacterOverview";
import { Player } from "@player";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { calculateSkillProgress } from "../../PersonObjects/formulas/skill";
import { formatExp } from "../formatNumber";

interface IProps {
  name: string;
  color?: React.CSSProperties["color"];
}

interface InnerProps {
  name: keyof typeof skillNameMap;
  color?: React.CSSProperties["color"];
}

const skillMultUpdaters = {
  //Used by skill bars to calculate the mult
  Hack: () => Player.mults.hacking * currentNodeMults.HackingLevelMultiplier,
  Str: () => Player.mults.strength * currentNodeMults.StrengthLevelMultiplier,
  Def: () => Player.mults.defense * currentNodeMults.DefenseLevelMultiplier,
  Dex: () => Player.mults.dexterity * currentNodeMults.DexterityLevelMultiplier,
  Agi: () => Player.mults.agility * currentNodeMults.AgilityLevelMultiplier,
  Cha: () => Player.mults.charisma * currentNodeMults.CharismaLevelMultiplier,
  Int: () => 1,
} as const;

const skillNameMap = {
  Hack: "hacking",
  Str: "strength",
  Def: "defense",
  Dex: "dexterity",
  Agi: "agility",
  Cha: "charisma",
  Int: "intelligence",
} as const;

function isSkill(name: string): name is keyof typeof skillNameMap {
  return name in skillNameMap;
}

// This part is extracted so that the outer table parts don't need to get
// rerendered on every refresh.
function StatsProgressBarInner({ name, color }: InnerProps): React.ReactElement {
  const domRef: React.Ref<HTMLElement> = useRef(null);
  const [progress, setProgress] = useState(calculateSkillProgress(0));
  useEffect(() => {
    const clearSubscription = OverviewEventEmitter.subscribe(() => {
      const mult = skillMultUpdaters[name]();
      // Since this creates a new object every time, it normally causes a rerender every time.
      const newProgress = calculateSkillProgress(Player.exp[skillNameMap[name]], mult);
      setProgress((progress) => {
        if (progress.progress === newProgress.progress) {
          // Nothing has changed, return the original object for no rerender.
          return progress;
        }
        // This takes place in the state updater for progress.
        const ele = domRef.current?.firstElementChild;
        if (!ele) return newProgress;

        const isWrapping =
          newProgress.currentSkill === progress.currentSkill + 1 && newProgress.progress < progress.progress;
        const sameLevel =
          newProgress.currentSkill === progress.currentSkill && newProgress.progress > progress.progress;
        const keyframes = [
          { transform: `translateX(${progress.progress - 100}%)`, offset: 0 },
          { transform: `translateX(${newProgress.progress - 100}%)`, offset: 1 },
        ];
        if (isWrapping) {
          const offset = (100 - progress.progress) / (100 + newProgress.progress - progress.progress);
          keyframes.splice(1, 0, { transform: "translateX(0%)", offset }, { transform: "translateX(-100%)", offset });
        }
        // Use an instant animation for large or backward jumps, which is the
        // same as no animation at all.
        ele.animate(keyframes, { fill: "forwards", duration: isWrapping || sameLevel ? 400 : 0 });
        return newProgress;
      });
    });

    return clearSubscription;
  }, [name]);

  const tooltip = (
    <Typography sx={{ textAlign: "right" }}>
      <strong>Progress:</strong>&nbsp;
      {formatExp(progress.currentExperience)} ({progress.progress.toFixed(2)}%)
      <br />
      <strong>Remaining:</strong>&nbsp;
      {formatExp(progress.remainingExperience)} / {formatExp(progress.nextExperience - progress.baseExperience)}
    </Typography>
  );
  // We keep this component fixed (never rerender it) and manipulate it
  // strictly through the animate() API.
  const bar = useMemo(
    () => (
      <LinearProgress
        ref={domRef}
        variant="determinate"
        value={0}
        sx={{
          backgroundColor: "#111111",
          "& .MuiLinearProgress-bar1Determinate": {
            backgroundColor: color,
          },
        }}
      />
    ),
    [color],
  );
  return <Tooltip title={tooltip}>{bar}</Tooltip>;
}

export function StatsProgressBar({ name, color }: IProps): React.ReactElement {
  const { classes } = useStyles();

  if (!isSkill(name)) {
    return <></>;
  }

  return (
    <TableRow>
      <TableCell
        component="th"
        scope="row"
        colSpan={2}
        classes={{ root: classes.cellNone }}
        style={{ paddingBottom: "2px", position: "relative", top: "-3px" }}
      >
        <StatsProgressBarInner name={name} color={color} />
      </TableCell>
    </TableRow>
  );
}
