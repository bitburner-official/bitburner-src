// Root React Component for the Corporation UI
import React, { useMemo, useState, useEffect } from "react";

import { Theme, useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import { numeralWrapper } from "../numeralFormat";
import { Reputation } from "./Reputation";
import { KillScriptsModal } from "./KillScriptsModal";
import { convertTimeMsToTimeElapsedString, formatNumber } from "../../utils/StringHelperFunctions";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import ClearAllIcon from "@mui/icons-material/ClearAll";

import { Settings } from "../../Settings/Settings";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { Player } from "@player";
import { StatsProgressOverviewCell } from "./StatsProgressBar";
import { BitNodeMultipliers } from "../../BitNode/BitNodeMultipliers";

import { Box, Tooltip } from "@mui/material";

import { isClassWork } from "../../Work/ClassWork";
import { CONSTANTS } from "../../Constants";
import { isCreateProgramWork } from "../../Work/CreateProgramWork";
import { isGraftingWork } from "../../Work/GraftingWork";
import { isFactionWork } from "../../Work/FactionWork";
import { ReputationRate } from "./ReputationRate";
import { isCompanyWork } from "../../Work/CompanyWork";
import { isCrimeWork } from "../../Work/CrimeWork";
import { ActionIdentifier } from "../../Bladeburner/ActionIdentifier";
import { Bladeburner } from "../../Bladeburner/Bladeburner";
import { Skills } from "../../PersonObjects/Skills";
import { IBitNodeMultipliers } from "../../BitNode/BitNodeMultipliers";
import { Multipliers } from "../../PersonObjects/Multipliers";
import { calculateSkillProgress } from "../../PersonObjects/formulas/skill";

//This function will be called externally when intelligence is gained (or lost, via dev menu) as a stat to rerender.
//A useEffect on the main overview will be called to change this to a setState function. This will trigger a full
//rerender of the overview if it's displayed, but this happens once during a playthrough. No need to use interval
export let intelligenceGainedOrLost: () => void = () => {};

// Used to get the relevant bitnode multiplier from the given skill name
// TODO update bitnodemultipliers structure to make this unnecessary
const skillToBitnodeMultMap: Partial<Record<keyof Skills, keyof IBitNodeMultipliers>> = {
  hacking: "HackingLevelMultiplier",
  strength: "StrengthLevelMultiplier",
  defense: "DefenseLevelMultiplier",
  dexterity: "DexterityLevelMultiplier",
  agility: "AgilityLevelMultiplier",
  charisma: "CharismaLevelMultiplier",
  // No entry for intelligence since there is no mult for it
};

const skillToThemeColorMap: Record<keyof Skills, keyof Theme["colors"]> = {
  hacking: "hack",
  strength: "combat",
  defense: "combat",
  dexterity: "combat",
  agility: "combat",
  charisma: "cha",
  intelligence: "int",
};

// Used by lowest level components to update their state using a shared overview timer
// Without requiring any rerendering of the higher-level components
const stateUpdaters = new Map<string, () => void>();

interface SkillBarProps {
  name: keyof Skills & (keyof Multipliers | "intelligence");
}
function SkillBar({ name }: SkillBarProps): React.ReactElement {
  const theme = useTheme();
  const bitNodeMultKey = skillToBitnodeMultMap[name];
  const [mult, setMult] = useState(
    bitNodeMultKey ? Player.mults[name as keyof Multipliers] * BitNodeMultipliers[bitNodeMultKey] : 1,
  );
  const [progress, setProgress] = useState(calculateSkillProgress(Player.exp[name], mult));
  useEffect(() => {
    stateUpdaters.set(name + "Bar", () => {
      if (bitNodeMultKey) setMult(Player.mults[name as keyof Multipliers] * BitNodeMultipliers[bitNodeMultKey]);
      setProgress(calculateSkillProgress(Player.exp[name], mult));
    });
    return () => {
      stateUpdaters.delete(name + "Bar");
    };
  });
  return (
    <TableRow>
      <StatsProgressOverviewCell progress={progress} color={theme.colors[skillToThemeColorMap[name]]} />
    </TableRow>
  );
}

interface SkillValProps {
  name: keyof Skills;
  className: string;
}
export function SkillVal({ name, className }: SkillValProps): React.ReactElement {
  const [skillVal, setSkillVal] = useState(Player.skills[name]);
  useEffect(() => {
    stateUpdaters.set(name + "Val", () => setSkillVal(Player.skills[name]));
    return () => {
      stateUpdaters.delete(name + "Val");
    };
  });
  return <Typography classes={{ root: className }}>{formatNumber(skillVal)}(</Typography>;
}

interface SkillRowProps {
  name: keyof Skills & (keyof Multipliers | "intelligence");
  className: string;
  cellNone: string;
  showBar: boolean;
}
export function SkillRow({ name, className, cellNone, showBar }: SkillRowProps): React.ReactElement {
  const skillBar = showBar && <SkillBar name={name} />;
  return (
    <>
      <TableRow>
        <TableCell component="th" scope="row" classes={{ root: cellNone }}>
          <Typography classes={{ root: className }}>
            {name.charAt(0).toUpperCase() + name.substring(1)}&nbsp;
          </Typography>
        </TableCell>
        <TableCell align="right" classes={{ root: cellNone }}>
          <SkillVal name={name} className={className} />
        </TableCell>
        <TableCell align="right" classes={{ root: cellNone }}>
          <Typography id={"overview-" + name + "-hook"} classes={{ root: className }}>
            {/*Hook for player scripts*/}
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
    if (!parentOpen) return;
    const interval = setInterval(() => {
      for (const stateUpdater of stateUpdaters.values()) stateUpdater();
    }, 600); // Is 600ms too long?
    return () => clearInterval(interval);
  }, [parentOpen]);
  const classes = useStyles();
  return (
    <>
      <Table sx={{ display: "block", m: 1 }}>
        <TableBody>
          {rowWithHook(
            "HP",
            numeralWrapper.formatHp(Player.hp.current) + "\u00a0/\u00a0" + numeralWrapper.formatHp(Player.hp.max),
            classes.hp,
            classes.cellNone,
          )}
          {rowWithHook("Money", numeralWrapper.formatMoney(Player.money), classes.money, classes.cellNone)}
          <SkillRow name="hacking" className={classes.hack} cellNone={classes.cellNone} showBar={showBars} />
          <SkillRow name="strength" className={classes.combat} cellNone={classes.cellNone} showBar={showBars} />
          <SkillRow name="defense" className={classes.combat} cellNone={classes.cellNone} showBar={showBars} />
          <SkillRow name="dexterity" className={classes.combat} cellNone={classes.cellNone} showBar={showBars} />
          <SkillRow name="agility" className={classes.combat} cellNone={classes.cellNone} showBar={showBars} />
          <SkillRow name="charisma" className={classes.combat} cellNone={classes.cellNone} showBar={showBars} />
          {hasIntelligence ? (
            <SkillRow name="intelligence" className={classes.combat} cellNone={classes.cellNone} showBar={showBars} />
          ) : (
            <></>
          )}
          <TableRow>
            <TableCell component="th" scope="row" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-0" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-1" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="row" align="right" classes={{ root: classes.cell }}>
              <Typography id="overview-extra-hook-2" classes={{ root: classes.hack }}>
                {/*Hook for player scripts*/}
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

function ActionText(props: { action: ActionIdentifier }): React.ReactElement {
  // This component should never be called if Bladeburner is null, due to conditional checks in BladeburnerText
  const action = (Player.bladeburner as Bladeburner).getTypeAndNameFromActionId(props.action);
  return (
    <Typography>
      {action.type}: {action.name}
    </Typography>
  );
}

function BladeburnerText(): React.ReactElement {
  const classes = useStyles();
  const action = Player.bladeburner?.action;
  return useMemo(
    () =>
      //Action type 1 is Idle, see ActionTypes.ts
      //TODO 2.3: Revamp typing in bladeburner
      !action || action.type === 1 ? (
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
  const classes = useStyles();
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
  if (Player.currentWork === null || Player.focus) return <></>;

  let details = <></>;
  let header = <></>;
  let innerText = <></>;
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
    innerText = <>{convertTimeMsToTimeElapsedString(Player.currentWork.cyclesWorked * CONSTANTS._idleSpeed)}</>;
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
        <ReputationRate reputation={factionWork.getReputationRate() * (1000 / CONSTANTS._idleSpeed)} />)
      </>
    );
  }
  if (isCompanyWork(Player.currentWork)) {
    const companyWork = Player.currentWork;
    details = (
      <>
        {Player.jobs[companyWork.companyName]} at <strong>{companyWork.companyName}</strong>
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
        <ReputationRate reputation={companyWork.getGainRates().reputation * (1000 / CONSTANTS._idleSpeed)} />)
      </>
    );
  }

  return (
    <WorkInProgressOverview tooltip={details} header={header}>
      {innerText}
    </WorkInProgressOverview>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  }),
);

export { useStyles as characterOverviewStyles };

function rowWithHook(name: string, value: string, className: string, cellNone: string): React.ReactElement {
  return useMemo(
    () => (
      <TableRow>
        <TableCell component="th" scope="row" classes={{ root: cellNone }}>
          <Typography classes={{ root: className }}>{name}&nbsp;</Typography>
        </TableCell>
        <TableCell align="right" classes={{ root: cellNone }}>
          <Typography classes={{ root: className }}>{value}</Typography>
        </TableCell>
        <TableCell align="right" classes={{ root: cellNone }}>
          <Typography id={"overview-" + name.toLowerCase() + "-str-hook"} classes={{ root: className }}>
            {/*Hook for player scripts*/}
          </Typography>
        </TableCell>
      </TableRow>
    ),
    [name, value, className, cellNone],
  );
}

function statItem(
  name: string,
  value: number,
  className: string,
  cellNone: string,
  themeColor: React.CSSProperties["color"],
  exp: number,
  mult: number,
  bitNodeMult: number,
): React.ReactElement[] {
  return [
    rowWithHook(name, formatNumber(value, 0), className, cellNone),
    useMemo(() => {
      const progress = Player.calculateSkillProgress(exp, mult * bitNodeMult);
      return (
        <TableRow>
          {!Settings.DisableOverviewProgressBars && (
            <StatsProgressOverviewCell progress={progress} color={themeColor} />
          )}
        </TableRow>
      );
    }, [Settings.DisableOverviewProgressBars, themeColor, exp, mult, bitNodeMult]),
  ];
}
