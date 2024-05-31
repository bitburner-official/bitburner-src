import type { ActionIdentifier } from "../../Bladeburner/Types";

// Root React Component for the Corporation UI
import React, { useMemo, useState, useEffect, ReactNode } from "react";
import { Box, Button, IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { Theme, useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

import { Player } from "@player";
import { formatHp, formatMoney, formatSkill } from "../formatNumber";
import { Reputation } from "./Reputation";
import { KillScriptsModal } from "./KillScriptsModal";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

import { Settings } from "../../Settings/Settings";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { StatsProgressOverviewCell } from "./StatsProgressBar";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";

import { isClassWork } from "../../Work/ClassWork";
import { CONSTANTS } from "../../Constants";
import { isCreateProgramWork } from "../../Work/CreateProgramWork";
import { isGraftingWork } from "../../Work/GraftingWork";
import { isFactionWork } from "../../Work/FactionWork";
import { ReputationRate } from "./ReputationRate";
import { isCompanyWork } from "../../Work/CompanyWork";
import { isCrimeWork } from "../../Work/CrimeWork";
import { Skills } from "../../PersonObjects/Skills";
import { calculateSkillProgress } from "../../PersonObjects/formulas/skill";
import { EventEmitter } from "../../utils/EventEmitter";
import { useRerender } from "./hooks";

type SkillRowName = "Hack" | "Str" | "Def" | "Dex" | "Agi" | "Cha" | "Int";
type RowName = SkillRowName | "HP" | "Money";
const OverviewEventEmitter = new EventEmitter();

// These values aren't displayed, they're just used for comparison to check if state has changed
const valUpdaters: Record<RowName, () => any> = {
  HP: () => Player.hp.current + "|" + Player.hp.max, // This isn't displayed, it's just compared for updates.
  Money: () => Player.money,
  Hack: () => Player.skills.hacking,
  Str: () => Player.skills.strength,
  Def: () => Player.skills.defense,
  Dex: () => Player.skills.dexterity,
  Agi: () => Player.skills.agility,
  Cha: () => Player.skills.charisma,
  Int: () => Player.skills.intelligence,
};

//These formattedVals functions don't take in a value because of the weirdness around HP.
const formattedVals: Record<RowName, () => string> = {
  HP: () => `${formatHp(Player.hp.current)} / ${formatHp(Player.hp.max)}`,
  Money: () => formatMoney(Player.money),
  Hack: () => formatSkill(Player.skills.hacking),
  Str: () => formatSkill(Player.skills.strength),
  Def: () => formatSkill(Player.skills.defense),
  Dex: () => formatSkill(Player.skills.dexterity),
  Agi: () => formatSkill(Player.skills.agility),
  Cha: () => formatSkill(Player.skills.charisma),
  Int: () => formatSkill(Player.skills.intelligence),
};

const skillMultUpdaters: Record<SkillRowName, () => number> = {
  //Used by skill bars to calculate the mult
  Hack: () => Player.mults.hacking * currentNodeMults.HackingLevelMultiplier,
  Str: () => Player.mults.strength * currentNodeMults.StrengthLevelMultiplier,
  Def: () => Player.mults.defense * currentNodeMults.DefenseLevelMultiplier,
  Dex: () => Player.mults.dexterity * currentNodeMults.DexterityLevelMultiplier,
  Agi: () => Player.mults.agility * currentNodeMults.AgilityLevelMultiplier,
  Cha: () => Player.mults.charisma * currentNodeMults.CharismaLevelMultiplier,
  Int: () => 1,
};

const skillNameMap: Record<SkillRowName, keyof Skills> = {
  Hack: "hacking",
  Str: "strength",
  Def: "defense",
  Dex: "dexterity",
  Agi: "agility",
  Cha: "charisma",
  Int: "intelligence",
};

interface SkillBarProps {
  name: SkillRowName;
  color?: string;
}
function SkillBar({ name, color }: SkillBarProps): React.ReactElement {
  const [progress, setProgress] = useState(calculateSkillProgress(0));
  useEffect(() => {
    const clearSubscription = OverviewEventEmitter.subscribe(() => {
      const mult = skillMultUpdaters[name]();
      setProgress(calculateSkillProgress(Player.exp[skillNameMap[name]], mult));
    });

    return clearSubscription;
  }, [name]);

  return (
    <TableRow>
      <StatsProgressOverviewCell progress={progress} color={color} />
    </TableRow>
  );
}

interface ValProps {
  name: RowName;
  color?: string;
}
export function Val({ name, color }: ValProps): React.ReactElement {
  //val isn't actually used here, the update of val just forces a refresh of the formattedVal that gets shown
  const [__, setVal] = useState(valUpdaters[name]());
  useEffect(() => {
    const clearSubscription = OverviewEventEmitter.subscribe(() => setVal(valUpdaters[name]()));
    return clearSubscription;
  }, [name]);

  return <Typography color={color}>{formattedVals[name]()}</Typography>;
}

interface DataRowProps {
  name: RowName; //name for UI display
  showBar: boolean;
  color?: string;
  cellType: "cellNone" | "cell";
}
export function DataRow({ name, showBar, color, cellType }: DataRowProps): React.ReactElement {
  const { classes } = useStyles();
  const isSkill = name in skillNameMap;
  const skillBar = showBar && isSkill ? <SkillBar name={name as SkillRowName} color={color} /> : <></>;
  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" classes={{ root: classes[cellType] }}>
          <Typography color={color}>{name}&nbsp;</Typography>
        </TableCell>
        <TableCell align="right" classes={{ root: classes[cellType] }}>
          <Val name={name} color={color} />
        </TableCell>
        <TableCell align="right" classes={{ root: classes[cellType] }}>
          <Typography id={"overview-" + name.toLowerCase() + "-hook"} color={color}>
            {}
          </Typography>
        </TableCell>
      </TableRow>
      {skillBar}
    </>
  );
}

interface OverviewProps {
  parentOpen: boolean;
  save: () => void;
  killScripts: () => void;
}

export function CharacterOverview({ parentOpen, save, killScripts }: OverviewProps): React.ReactElement {
  const [killOpen, setKillOpen] = useState(false);
  const [hasIntelligence, setHasIntelligence] = useState(Player.skills.intelligence > 0);
  const [showBars, setShowBars] = useState(!Settings.DisableOverviewProgressBars);
  useEffect(() => {
    if (!parentOpen) return; // No rerendering if overview is hidden, for performance
    const interval = setInterval(() => {
      setHasIntelligence(Player.skills.intelligence > 0);
      setShowBars(!Settings.DisableOverviewProgressBars);
      OverviewEventEmitter.emit(); // Tell every other updating component to update as well
    }, 600);
    return () => clearInterval(interval);
  }, [parentOpen]);
  const { classes } = useStyles();
  const theme = useTheme();
  return (
    <>
      <Table sx={{ display: "block", m: 1 }}>
        <TableBody>
          <DataRow name="HP" showBar={false} color={theme.colors.hp} cellType={"cellNone"} />
          <DataRow name="Money" showBar={false} color={theme.colors.money} cellType={"cell"} />
          <DataRow name="Hack" showBar={showBars} color={theme.colors.hack} cellType={"cell"} />
          <DataRow name="Str" showBar={showBars} color={theme.colors.combat} cellType={"cellNone"} />
          <DataRow name="Def" showBar={showBars} color={theme.colors.combat} cellType={"cellNone"} />
          <DataRow name="Dex" showBar={showBars} color={theme.colors.combat} cellType={"cellNone"} />
          <DataRow name="Agi" showBar={showBars} color={theme.colors.combat} cellType={"cell"} />
          <DataRow name="Cha" showBar={showBars} color={theme.colors.cha} cellType={"cell"} />
          {hasIntelligence ? (
            <DataRow name="Int" showBar={showBars} color={theme.colors.int} cellType={"cell"} />
          ) : (
            <></>
          )}
          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-0" color={theme.colors.hack}>
                {}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-1" color={theme.colors.hack}>
                {}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-2" color={theme.colors.hack}>
                {}
              </Typography>
            </TableCell>
          </TableRow>
          <Work />
          <BladeburnerText />
        </TableBody>
      </Table>
      <Box sx={{ display: "flex", borderTop: `1px solid ${Settings.theme.welllight}` }}>
        <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
          <IconButton aria-label="save game" onClick={save}>
            <Tooltip title={Settings.AutosaveInterval !== 0 ? "Save game" : "Save game (auto-saves are disabled!)"}>
              <SaveIcon color={Settings.AutosaveInterval !== 0 ? "primary" : "error"} />
            </Tooltip>
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end", alignItems: "center" }}>
          <IconButton aria-label="kill all scripts" onClick={() => setKillOpen(true)}>
            <Tooltip title="Kill all running scripts">
              <ClearAllIcon color="error" />
            </Tooltip>
          </IconButton>
        </Box>
      </Box>
      <KillScriptsModal open={killOpen} onClose={() => setKillOpen(false)} killScripts={killScripts} />
    </>
  );
}

function ActionText({ action }: { action: ActionIdentifier }): React.ReactElement {
  const bladeburner = Player.bladeburner;
  if (!bladeburner) return <></>;
  return (
    <Typography>
      {action.type}: {action.name}
    </Typography>
  );
}

function BladeburnerText(): React.ReactElement {
  const { classes } = useStyles();
  const rerender = useRerender();
  useEffect(() => {
    const clearSubscription = OverviewEventEmitter.subscribe(rerender);
    return clearSubscription;
  }, [rerender]);

  const action = Player.bladeburner?.action;
  return useMemo(
    () =>
      !action ? (
        <></>
      ) : (
        <>
          <TableRow>
            <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.cellNone }}>
              <Typography>Bladeburner:</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.cellNone }}>
              <ActionText action={action} />
            </TableCell>
          </TableRow>
        </>
      ),
    [action, classes.cellNone],
  );
}

interface WorkInProgressOverviewProps {
  tooltip: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

const onClickFocusWork = (): void => {
  Player.startFocusing();
  Router.toPage(Page.Work);
};
function WorkInProgressOverview({ tooltip, children, header }: WorkInProgressOverviewProps): React.ReactElement {
  const { classes } = useStyles();
  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.workCell }}>
          <Tooltip title={<>{tooltip}</>}>
            <Typography className={classes.workHeader} sx={{ pt: 1, pb: 0.5 }}>
              {header}
            </Typography>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell component="th" scope="row" colSpan={2} classes={{ root: classes.workCell }}>
          <Typography className={classes.workSubtitles}>{children}</Typography>
        </TableCell>
      </TableRow>
      {useMemo(
        () => (
          <TableRow>
            <TableCell component="th" scope="row" align="center" colSpan={2} classes={{ root: classes.cellNone }}>
              <Button sx={{ mt: 1 }} onClick={onClickFocusWork}>
                Focus
              </Button>
            </TableCell>
          </TableRow>
        ),
        [classes.cellNone],
      )}
    </>
  );
}

function Work(): React.ReactElement {
  const rerender = useRerender();
  useEffect(() => {
    const clearSubscription = OverviewEventEmitter.subscribe(rerender);
    return clearSubscription;
  }, [rerender]);

  if (Player.currentWork === null || Player.focus) return <></>;

  let details: ReactNode = "";
  let header: ReactNode = "";
  let innerText: ReactNode = "";
  if (isCrimeWork(Player.currentWork)) {
    const crime = Player.currentWork.getCrime();
    const perc = (Player.currentWork.unitCompleted / crime.time) * 100;

    details = <>{Player.currentWork.crimeType}</>;
    header = <>You are attempting to {Player.currentWork.crimeType}</>;
    innerText = <>{perc.toFixed(2)}%</>;
  }
  if (isClassWork(Player.currentWork)) {
    details = <>{Player.currentWork.getClass().youAreCurrently}</>;
    header = <>You are {Player.currentWork.getClass().youAreCurrently}</>;
    innerText = <>{convertTimeMsToTimeElapsedString(Player.currentWork.cyclesWorked * CONSTANTS.MilliPerCycle)}</>;
  }
  if (isCreateProgramWork(Player.currentWork)) {
    const create = Player.currentWork;
    details = <>Coding {create.programName}</>;
    header = <>Creating a program</>;
    innerText = (
      <>
        {create.programName} {((create.unitCompleted / create.unitNeeded()) * 100).toFixed(2)}%
      </>
    );
  }
  if (isGraftingWork(Player.currentWork)) {
    const graft = Player.currentWork;
    details = <>Grafting {graft.augmentation}</>;
    header = <>Grafting an Augmentation</>;
    innerText = (
      <>
        <strong>{((graft.unitCompleted / graft.unitNeeded()) * 100).toFixed(2)}%</strong> done
      </>
    );
  }

  if (isFactionWork(Player.currentWork)) {
    const factionWork = Player.currentWork;
    header = (
      <>
        Working for <strong>{factionWork.factionName}</strong>
      </>
    );
    innerText = (
      <>
        <Reputation reputation={factionWork.getFaction().playerReputation} /> rep
        <br />(
        <ReputationRate reputation={factionWork.getReputationRate() * (1000 / CONSTANTS.MilliPerCycle)} />)
      </>
    );
  }
  if (isCompanyWork(Player.currentWork)) {
    const companyWork = Player.currentWork;
    const job = Player.jobs[companyWork.companyName];
    if (!job) return <></>;
    details = (
      <>
        {job} at <strong>{companyWork.companyName}</strong>
      </>
    );

    header = (
      <>
        Working at <strong>{companyWork.companyName}</strong>
      </>
    );
    innerText = (
      <>
        <Reputation reputation={companyWork.getCompany().playerReputation} /> rep
        <br />(
        <ReputationRate reputation={companyWork.getGainRates(job).reputation * (1000 / CONSTANTS.MilliPerCycle)} />)
      </>
    );
  }

  return (
    <WorkInProgressOverview tooltip={details} header={header}>
      {innerText}
    </WorkInProgressOverview>
  );
}

const useStyles = makeStyles()((theme: Theme) => ({
  workCell: {
    textAlign: "center",
    maxWidth: "200px",
    borderBottom: "none",
    padding: 0,
    margin: 0,
  },

  workHeader: {
    fontSize: "0.9rem",
  },

  workSubtitles: {
    fontSize: "0.8rem",
  },

  cellNone: {
    borderBottom: "none",
    padding: 0,
    margin: 0,
  },
  cell: {
    padding: 0,
    margin: 0,
  },
  hp: {
    color: theme.colors.hp,
  },
  money: {
    color: theme.colors.money,
  },
  hack: {
    color: theme.colors.hack,
  },
  combat: {
    color: theme.colors.combat,
  },
  cha: {
    color: theme.colors.cha,
  },
  int: {
    color: theme.colors.int,
  },
}));

export { useStyles };
