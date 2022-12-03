import React, { useState, useEffect, useMemo } from "react";
import { KEY } from "../../utils/helpers/keyCodes";
import clsx from "clsx";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Badge from "@mui/material/Badge";

import ComputerIcon from "@mui/icons-material/Computer";
import LastPageIcon from "@mui/icons-material/LastPage"; // Terminal
import CreateIcon from "@mui/icons-material/Create"; // Create Script
import StorageIcon from "@mui/icons-material/Storage"; // Active Scripts
import BugReportIcon from "@mui/icons-material/BugReport"; // Create Program
import EqualizerIcon from "@mui/icons-material/Equalizer"; // Stats
import ContactsIcon from "@mui/icons-material/Contacts"; // Factions
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow"; // Augmentations
import AccountTreeIcon from "@mui/icons-material/AccountTree"; // Hacknet
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"; // Sleeves
import LocationCityIcon from "@mui/icons-material/LocationCity"; // City
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive"; // Travel
import WorkIcon from "@mui/icons-material/Work"; // Job
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // Stock Market
import FormatBoldIcon from "@mui/icons-material/FormatBold"; // Bladeburner
import BusinessIcon from "@mui/icons-material/Business"; // Corp
import SportsMmaIcon from "@mui/icons-material/SportsMma"; // Gang
import CheckIcon from "@mui/icons-material/Check"; // Milestones
import HelpIcon from "@mui/icons-material/Help"; // Tutorial
import SettingsIcon from "@mui/icons-material/Settings"; // options
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard"; // Dev
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Achievements
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PublicIcon from "@mui/icons-material/Public";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { CONSTANTS } from "../../Constants";
import { iTutorialSteps, iTutorialNextStep, ITutorial } from "../../InteractiveTutorial";
import { getAvailableCreatePrograms } from "../../Programs/ProgramHelpers";
import { Settings } from "../../Settings/Settings";
import { AugmentationNames } from "../../Augmentation/data/AugmentationNames";

import { ProgramsSeen } from "../../Programs/ui/ProgramsRoot";
import { InvitationsSeen } from "../../Faction/ui/FactionsRoot";
import { hash } from "../../hash/hash";
import { Locations } from "../../Locations/Locations";
import { ListItemButton } from "@mui/material";

const openedMixin = (theme: Theme): CSSObject => ({
  width: theme.spacing(31),
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(2)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  width: theme.spacing(31),
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    active: {
      borderLeft: "3px solid " + theme.palette.primary.main,
    },
    listitem: {},
  }),
);

interface IProps {
  page: Page;
  opened: boolean;
  onToggled: (newValue: boolean) => void;
}

export function SidebarRoot(props: IProps): React.ReactElement {
  const setRerender = useState(false)[1];
  function rerender(): void {
    setRerender((old) => !old);
  }

  useEffect(() => {
    const id = setInterval(rerender, 200);
    return () => clearInterval(id);
  }, []);

  const [hackingOpen, setHackingOpen] = useState(true);
  const [characterOpen, setCharacterOpen] = useState(true);
  const [worldOpen, setWorldOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(true);

  const flashTerminal = useMemo(
    () =>
      ITutorial.currStep === iTutorialSteps.CharacterGoToTerminalPage ||
      ITutorial.currStep === iTutorialSteps.ActiveScriptsPage,
    [ITutorial.currStep],
  );

  const flashStats = useMemo(() => ITutorial.currStep === iTutorialSteps.GoToCharacterPage, [ITutorial.currStep]);

  const flashActiveScripts = useMemo(
    () => ITutorial.currStep === iTutorialSteps.TerminalGoToActiveScriptsPage,
    [ITutorial.currStep],
  );

  const flashHacknet = useMemo(() => ITutorial.currStep === iTutorialSteps.GoToHacknetNodesPage, [ITutorial.currStep]);

  const flashCity = useMemo(
    () => ITutorial.currStep === iTutorialSteps.HacknetNodesGoToWorldPage,
    [ITutorial.currStep],
  );

  const flashTutorial = useMemo(() => ITutorial.currStep === iTutorialSteps.WorldDescription, [ITutorial.currStep]);

  const augmentationCount = Player.queuedAugmentations.length;
  const invitationsCount = Player.factionInvitations.filter((f) => !InvitationsSeen.includes(f)).length;
  const programCount = getAvailableCreatePrograms().length - ProgramsSeen.length;

  const canOpenFactions = useMemo(
    () =>
      Player.factionInvitations.length > 0 ||
      Player.factions.length > 0 ||
      Player.augmentations.length > 0 ||
      Player.queuedAugmentations.length > 0 ||
      Player.sourceFiles.length > 0,
    [Player.factionInvitations, Player.factions, Player.augmentations, Player.queuedAugmentations, Player.sourceFiles],
  );

  const canOpenAugmentations = useMemo(
    () => Player.augmentations.length > 0 || Player.queuedAugmentations.length > 0 || Player.sourceFiles.length > 0,
    [Player.augmentations, Player.queuedAugmentations, Player.sourceFiles],
  );

  const canOpenSleeves = useMemo(() => Player.sleeves.length > 0, [Player.sleeves]);

  const canCorporation = useMemo(() => !!Player.corporation, [Player.corporation]);
  const canGang = useMemo(() => !!Player.gang, [Player.gang]);
  const canJob = useMemo(() => Object.values(Player.jobs).length > 0, [Player.jobs]);
  const canStockMarket = useMemo(() => Player.hasWseAccount, [Player.hasWseAccount]);
  const canBladeburner = useMemo(() => !!Player.bladeburner, [Player.bladeburner]);
  const canStaneksGift = useMemo(
    () => Player.augmentations.some((aug) => aug.name === AugmentationNames.StaneksGift1),
    [Player.augmentations],
  );

  function clickTerminal(): void {
    Router.toTerminal();
    if (flashTerminal) iTutorialNextStep();
  }

  function clickScriptEditor(): void {
    Router.toScriptEditor();
  }

  function clickStats(): void {
    Router.toStats();
    if (flashStats) iTutorialNextStep();
  }

  function clickActiveScripts(): void {
    Router.toActiveScripts();
    if (flashActiveScripts) iTutorialNextStep();
  }

  function clickCreateProgram(): void {
    Router.toCreateProgram();
  }

  function clickStaneksGift(): void {
    Router.toStaneksGift();
  }

  function clickFactions(): void {
    Router.toFactions();
  }

  function clickAugmentations(): void {
    Router.toAugmentations();
  }

  function clickSleeves(): void {
    Router.toSleeves();
  }

  function clickHacknet(): void {
    Router.toHacknetNodes();
    if (flashHacknet) iTutorialNextStep();
  }

  function clickCity(): void {
    Router.toCity();
    if (flashCity) iTutorialNextStep();
  }

  function clickTravel(): void {
    Router.toTravel();
  }

  function clickJob(): void {
    Router.toJob(Locations[Object.keys(Player.jobs)[0]]);
  }

  function clickStockMarket(): void {
    Router.toStockMarket();
  }

  function clickBladeburner(): void {
    Router.toBladeburner();
  }

  function clickCorp(): void {
    Router.toCorporation();
  }

  function clickGang(): void {
    Router.toGang();
  }

  function clickTutorial(): void {
    Router.toTutorial();
    if (flashTutorial) iTutorialNextStep();
  }

  function clickMilestones(): void {
    Router.toMilestones();
  }
  function clickOptions(): void {
    Router.toGameOptions();
  }

  function clickDev(): void {
    Router.toDevMenu();
  }

  function clickAchievements(): void {
    Router.toAchievements();
  }

  useEffect(() => {
    // Shortcuts to navigate through the game
    //  Alt-t - Terminal
    //  Alt-c - Character
    //  Alt-e - Script editor
    //  Alt-s - Active scripts
    //  Alt-h - Hacknet Nodes
    //  Alt-w - City
    //  Alt-j - Job
    //  Alt-r - Travel Agency of current city
    //  Alt-p - Create program
    //  Alt-f - Factions
    //  Alt-a - Augmentations
    //  Alt-u - Tutorial
    //  Alt-o - Options
    //  Alt-b - Bladeburner
    //  Alt-g - Gang
    function handleShortcuts(this: Document, event: KeyboardEvent): void {
      if (Settings.DisableHotkeys) return;
      if ((Player.currentWork && Player.focus) || Router.page() === Page.BitVerse) return;
      if (event.key === KEY.T && event.altKey) {
        event.preventDefault();
        clickTerminal();
      } else if (event.key === KEY.C && event.altKey) {
        event.preventDefault();
        clickStats();
      } else if (event.key === KEY.E && event.altKey) {
        event.preventDefault();
        clickScriptEditor();
      } else if (event.key === KEY.S && event.altKey) {
        event.preventDefault();
        clickActiveScripts();
      } else if (event.key === KEY.H && event.altKey) {
        event.preventDefault();
        clickHacknet();
      } else if (event.key === KEY.W && event.altKey) {
        event.preventDefault();
        clickCity();
      } else if (event.key === KEY.J && event.altKey && !event.ctrlKey && !event.metaKey && canJob) {
        // ctrl/cmd + alt + j is shortcut to open Chrome dev tools
        event.preventDefault();
        clickJob();
      } else if (event.key === KEY.R && event.altKey) {
        event.preventDefault();
        clickTravel();
      } else if (event.key === KEY.P && event.altKey) {
        event.preventDefault();
        clickCreateProgram();
      } else if (event.key === KEY.F && event.altKey) {
        if (props.page == Page.Terminal && Settings.EnableBashHotkeys) {
          return;
        }
        event.preventDefault();
        clickFactions();
      } else if (event.key === KEY.A && event.altKey) {
        event.preventDefault();
        clickAugmentations();
      } else if (event.key === KEY.U && event.altKey) {
        event.preventDefault();
        clickTutorial();
      } else if (event.key === KEY.O && event.altKey) {
        event.preventDefault();
        clickOptions();
      } else if (event.key === KEY.B && event.altKey && Player.bladeburner) {
        event.preventDefault();
        clickBladeburner();
      } else if (event.key === KEY.G && event.altKey && Player.gang) {
        event.preventDefault();
        clickGang();
      }
    }

    document.addEventListener("keydown", handleShortcuts);
    return () => document.removeEventListener("keydown", handleShortcuts);
  }, []);

  const classes = useStyles();
  const [open, setOpen] = useState(props.opened);
  const toggleDrawer = (): void => setOpen((old) => !old);

  useEffect(() => {
    props.onToggled(open);
  }, [open]);

  return (
    <Drawer open={open} anchor="left" variant="permanent">
      <ListItemButton classes={{ root: classes.listitem }} onClick={toggleDrawer}>
        <ListItemIcon>
          {!open ? <ChevronRightIcon color="primary" /> : <ChevronLeftIcon color="primary" />}
        </ListItemIcon>
        <ListItemText
          primary={
            <Tooltip title={hash()}>
              <Typography>Bitburner v{CONSTANTS.VersionString}</Typography>
            </Tooltip>
          }
        />
      </ListItemButton>
      <Divider />
      <List>
        <ListItemButton classes={{ root: classes.listitem }} onClick={() => setHackingOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "Hacking" : ""}>
              <ComputerIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>Hacking</Typography>} />
          {hackingOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItemButton>
        <Collapse in={hackingOpen} timeout="auto" unmountOnExit>
          <List>
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Terminal"}
              className={clsx({
                [classes.active]: props.page === Page.Terminal,
              })}
              onClick={clickTerminal}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Terminal" : ""}>
                  <LastPageIcon
                    color={flashTerminal ? "error" : props.page !== Page.Terminal ? "secondary" : "primary"}
                  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={flashTerminal ? "error" : props.page !== Page.Terminal ? "secondary" : "primary"}>
                  Terminal
                </Typography>
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Script Editor"}
              className={clsx({
                [classes.active]: props.page === Page.ScriptEditor,
              })}
              onClick={clickScriptEditor}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Script Editor" : ""}>
                  <CreateIcon color={props.page !== Page.ScriptEditor ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.ScriptEditor ? "secondary" : "primary"}>
                  Script Editor
                </Typography>
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Active Scripts"}
              className={clsx({
                [classes.active]: props.page === Page.ActiveScripts,
              })}
              onClick={clickActiveScripts}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Active Scripts" : ""}>
                  <StorageIcon
                    color={flashActiveScripts ? "error" : props.page !== Page.ActiveScripts ? "secondary" : "primary"}
                  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography
                  color={flashActiveScripts ? "error" : props.page !== Page.ActiveScripts ? "secondary" : "primary"}
                >
                  Active Scripts
                </Typography>
              </ListItemText>
            </ListItemButton>
            <ListItemButton
              key={"Create Program"}
              className={clsx({
                [classes.active]: props.page === Page.CreateProgram,
              })}
              onClick={clickCreateProgram}
            >
              <ListItemIcon>
                <Badge badgeContent={programCount > 0 ? programCount : undefined} color="error">
                  <Tooltip title={!open ? "Create Program" : ""}>
                    <BugReportIcon color={props.page !== Page.CreateProgram ? "secondary" : "primary"} />
                  </Tooltip>
                </Badge>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.CreateProgram ? "secondary" : "primary"}>
                  Create Program
                </Typography>
              </ListItemText>
            </ListItemButton>
            {canStaneksGift && (
              <ListItemButton
                key={"Staneks Gift"}
                className={clsx({
                  [classes.active]: props.page === Page.StaneksGift,
                })}
                onClick={clickStaneksGift}
              >
                <ListItemIcon>
                  <Tooltip title={!open ? "Stanek's Gift" : ""}>
                    <DeveloperBoardIcon color={props.page !== Page.StaneksGift ? "secondary" : "primary"} />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText>
                  <Typography color={props.page !== Page.StaneksGift ? "secondary" : "primary"}>
                    Stanek's Gift
                  </Typography>
                </ListItemText>
              </ListItemButton>
            )}
          </List>
        </Collapse>

        <Divider />
        <ListItemButton classes={{ root: classes.listitem }} onClick={() => setCharacterOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "Character" : ""}>
              <AccountBoxIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>Character</Typography>} />
          {characterOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItemButton>
        <Collapse in={characterOpen} timeout="auto" unmountOnExit>
          <ListItemButton
            key={"Stats"}
            className={clsx({
              [classes.active]: props.page === Page.Stats,
            })}
            onClick={clickStats}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Stats" : ""}>
                <EqualizerIcon color={flashStats ? "error" : props.page !== Page.Stats ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={flashStats ? "error" : props.page !== Page.Stats ? "secondary" : "primary"}>
                Stats
              </Typography>
            </ListItemText>
          </ListItemButton>
          {canOpenFactions && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Factions"}
              className={clsx({
                [classes.active]: [Page.Factions, Page.Faction].includes(props.page),
              })}
              onClick={clickFactions}
            >
              <ListItemIcon>
                <Badge badgeContent={invitationsCount !== 0 ? invitationsCount : undefined} color="error">
                  <Tooltip title={!open ? "Factions" : ""}>
                    <ContactsIcon
                      color={![Page.Factions, Page.Faction].includes(props.page) ? "secondary" : "primary"}
                    />
                  </Tooltip>
                </Badge>
              </ListItemIcon>
              <ListItemText>
                <Typography color={![Page.Factions, Page.Faction].includes(props.page) ? "secondary" : "primary"}>
                  Factions
                </Typography>
              </ListItemText>
            </ListItemButton>
          )}
          {canOpenAugmentations && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Augmentations"}
              className={clsx({
                [classes.active]: props.page === Page.Augmentations,
              })}
              onClick={clickAugmentations}
            >
              <ListItemIcon>
                <Badge badgeContent={augmentationCount !== 0 ? augmentationCount : undefined} color="error">
                  <Tooltip title={!open ? "Augmentations" : ""}>
                    <DoubleArrowIcon
                      style={{ transform: "rotate(-90deg)" }}
                      color={props.page !== Page.Augmentations ? "secondary" : "primary"}
                    />
                  </Tooltip>
                </Badge>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Augmentations ? "secondary" : "primary"}>
                  Augmentations
                </Typography>
              </ListItemText>
            </ListItemButton>
          )}
          <ListItemButton
            key={"Hacknet"}
            className={clsx({
              [classes.active]: props.page === Page.Hacknet,
            })}
            onClick={clickHacknet}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Hacknet" : ""}>
                <AccountTreeIcon
                  color={flashHacknet ? "error" : props.page !== Page.Hacknet ? "secondary" : "primary"}
                />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={flashHacknet ? "error" : props.page !== Page.Hacknet ? "secondary" : "primary"}>
                Hacknet
              </Typography>
            </ListItemText>
          </ListItemButton>
          {canOpenSleeves && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Sleeves"}
              className={clsx({
                [classes.active]: props.page === Page.Sleeves,
              })}
              onClick={clickSleeves}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Sleeves" : ""}>
                  <PeopleAltIcon color={props.page !== Page.Sleeves ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Sleeves ? "secondary" : "primary"}>Sleeves</Typography>
              </ListItemText>
            </ListItemButton>
          )}
        </Collapse>

        <Divider />
        <ListItemButton classes={{ root: classes.listitem }} onClick={() => setWorldOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "World" : ""}>
              <PublicIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>World</Typography>} />
          {worldOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItemButton>
        <Collapse in={worldOpen} timeout="auto" unmountOnExit>
          <ListItemButton
            key={"City"}
            className={clsx({
              [classes.active]:
                props.page === Page.City || props.page === Page.Grafting || props.page === Page.Location,
            })}
            onClick={clickCity}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "City" : ""}>
                <LocationCityIcon color={flashCity ? "error" : props.page !== Page.City ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={flashCity ? "error" : props.page !== Page.City ? "secondary" : "primary"}>
                City
              </Typography>
            </ListItemText>
          </ListItemButton>
          <ListItemButton
            key={"Travel"}
            className={clsx({
              [classes.active]: props.page === Page.Travel,
            })}
            onClick={clickTravel}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Travel" : ""}>
                <AirplanemodeActiveIcon color={props.page !== Page.Travel ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Travel ? "secondary" : "primary"}>Travel</Typography>
            </ListItemText>
          </ListItemButton>
          {canJob && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Job"}
              className={clsx({
                [classes.active]: props.page === Page.Job,
              })}
              onClick={clickJob}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Job" : ""}>
                  <WorkIcon color={props.page !== Page.Job ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Job ? "secondary" : "primary"}>Job</Typography>
              </ListItemText>
            </ListItemButton>
          )}
          {canStockMarket && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Stock Market"}
              className={clsx({
                [classes.active]: props.page === Page.StockMarket,
              })}
              onClick={clickStockMarket}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Stock Market" : ""}>
                  <TrendingUpIcon color={props.page !== Page.StockMarket ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.StockMarket ? "secondary" : "primary"}>Stock Market</Typography>
              </ListItemText>
            </ListItemButton>
          )}
          {canBladeburner && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Bladeburner"}
              className={clsx({
                [classes.active]: props.page === Page.Bladeburner,
              })}
              onClick={clickBladeburner}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Bladeburner" : ""}>
                  <FormatBoldIcon color={props.page !== Page.Bladeburner ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Bladeburner ? "secondary" : "primary"}>Bladeburner</Typography>
              </ListItemText>
            </ListItemButton>
          )}
          {canCorporation && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Corp"}
              className={clsx({
                [classes.active]: props.page === Page.Corporation,
              })}
              onClick={clickCorp}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Corp" : ""}>
                  <BusinessIcon color={props.page !== Page.Corporation ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Corporation ? "secondary" : "primary"}>Corp</Typography>
              </ListItemText>
            </ListItemButton>
          )}
          {canGang && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Gang"}
              className={clsx({
                [classes.active]: props.page === Page.Gang,
              })}
              onClick={clickGang}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Gang" : ""}>
                  <SportsMmaIcon color={props.page !== Page.Gang ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Gang ? "secondary" : "primary"}>Gang</Typography>
              </ListItemText>
            </ListItemButton>
          )}
        </Collapse>

        <Divider />
        <ListItemButton classes={{ root: classes.listitem }} onClick={() => setHelpOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "Help" : ""}>
              <LiveHelpIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>Help</Typography>} />
          {helpOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItemButton>
        <Collapse in={helpOpen} timeout="auto" unmountOnExit>
          <ListItemButton
            key={"Milestones"}
            className={clsx({
              [classes.active]: props.page === Page.Milestones,
            })}
            onClick={clickMilestones}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Milestones" : ""}>
                <CheckIcon color={props.page !== Page.Milestones ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Milestones ? "secondary" : "primary"}>Milestones</Typography>
            </ListItemText>
          </ListItemButton>
          <ListItemButton
            key={"Tutorial"}
            className={clsx({
              [classes.active]: props.page === Page.Tutorial,
            })}
            onClick={clickTutorial}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Tutorial" : ""}>
                <HelpIcon color={flashTutorial ? "error" : props.page !== Page.Tutorial ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={flashTutorial ? "error" : props.page !== Page.Tutorial ? "secondary" : "primary"}>
                Tutorial
              </Typography>
            </ListItemText>
          </ListItemButton>
          <ListItemButton
            key={"Achievements"}
            className={clsx({
              [classes.active]: props.page === Page.Achievements,
            })}
            onClick={clickAchievements}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Achievements" : ""}>
                <EmojiEventsIcon color={props.page !== Page.Achievements ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Achievements ? "secondary" : "primary"}>Achievements</Typography>
            </ListItemText>
          </ListItemButton>
          <ListItemButton
            key={"Options"}
            className={clsx({
              [classes.active]: props.page === Page.Options,
            })}
            onClick={clickOptions}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Options" : ""}>
                <SettingsIcon color={props.page !== Page.Options ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Options ? "secondary" : "primary"}>Options</Typography>
            </ListItemText>
          </ListItemButton>
          {process.env.NODE_ENV === "development" && (
            <ListItemButton
              classes={{ root: classes.listitem }}
              key={"Dev"}
              className={clsx({
                [classes.active]: props.page === Page.DevMenu,
              })}
              onClick={clickDev}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Dev" : ""}>
                  <DeveloperBoardIcon color={props.page !== Page.DevMenu ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.DevMenu ? "secondary" : "primary"}>Dev</Typography>
              </ListItemText>
            </ListItemButton>
          )}
        </Collapse>
      </List>
    </Drawer>
  );
}
