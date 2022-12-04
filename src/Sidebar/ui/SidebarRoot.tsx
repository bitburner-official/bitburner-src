import React, { useCallback, useState, useEffect } from "react";
import { KEYCODE } from "../../utils/helpers/keyCodes";
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
import ListItem from "@mui/material/ListItem";
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
import { Page, SimplePage } from "../../ui/Router";
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

  let flash: Page | null = null;
  switch (ITutorial.currStep) {
    case iTutorialSteps.CharacterGoToTerminalPage:
    case iTutorialSteps.ActiveScriptsPage:
      flash = Page.Terminal;
      break;
    case iTutorialSteps.GoToCharacterPage:
      flash = Page.Stats;
      break;
    case iTutorialSteps.TerminalGoToActiveScriptsPage:
      flash = Page.ActiveScripts;
      break;
    case iTutorialSteps.GoToHacknetNodesPage:
      flash = Page.Hacknet;
      break;
    case iTutorialSteps.HacknetNodesGoToWorldPage:
      flash = Page.City;
      break;
    case iTutorialSteps.WorldDescription:
      flash = Page.Tutorial;
      break;
  }

  const augmentationCount = Player.queuedAugmentations.length;
  const invitationsCount = Player.factionInvitations.filter((f) => !InvitationsSeen.includes(f)).length;
  const programCount = getAvailableCreatePrograms().length - ProgramsSeen.length;

  const canOpenFactions =
    Player.factionInvitations.length > 0 ||
    Player.factions.length > 0 ||
    Player.augmentations.length > 0 ||
    Player.queuedAugmentations.length > 0 ||
    Player.sourceFiles.length > 0;

  const canOpenAugmentations =
    Player.augmentations.length > 0 || Player.queuedAugmentations.length > 0 || Player.sourceFiles.length > 0;

  const canOpenSleeves = Player.sleeves.length > 0;

  const canCorporation = !!Player.corporation;
  const canGang = !!Player.gang;
  const canJob = Object.values(Player.jobs).length > 0;
  const canStockMarket = Player.hasWseAccount;
  const canBladeburner = !!Player.bladeburner;
  const canStaneksGift = Player.augmentations.some((aug) => aug.name === AugmentationNames.StaneksGift1);

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
      if (event.code === KEYCODE.T && event.altKey) {
        event.preventDefault();
        clickPage(Page.Terminal);
      } else if (event.code === KEYCODE.C && event.altKey) {
        event.preventDefault();
        clickPage(Page.Stats);
      } else if (event.code === KEYCODE.E && event.altKey) {
        event.preventDefault();
        clickPage(Page.ScriptEditor);
      } else if (event.code === KEYCODE.S && event.altKey) {
        event.preventDefault();
        clickPage(Page.ActiveScripts);
      } else if (event.code === KEYCODE.H && event.altKey) {
        event.preventDefault();
        clickPage(Page.Hacknet);
      } else if (event.code === KEYCODE.W && event.altKey) {
        event.preventDefault();
        clickPage(Page.City);
      } else if (event.code === KEYCODE.J && event.altKey && !event.ctrlKey && !event.metaKey && canJob) {
        // ctrl/cmd + alt + j is shortcut to open Chrome dev tools
        event.preventDefault();
        clickPage(Page.Job);
      } else if (event.code === KEYCODE.R && event.altKey) {
        event.preventDefault();
        clickPage(Page.Travel);
      } else if (event.code === KEYCODE.P && event.altKey) {
        event.preventDefault();
        clickPage(Page.CreateProgram);
      } else if (event.code === KEYCODE.F && event.altKey) {
        if (props.page == Page.Terminal && Settings.EnableBashHotkeys) {
          return;
        }
        event.preventDefault();
        clickPage(Page.Factions);
      } else if (event.code === KEYCODE.A && event.altKey) {
        event.preventDefault();
        clickPage(Page.Augmentations);
      } else if (event.code === KEYCODE.U && event.altKey) {
        event.preventDefault();
        clickPage(Page.Tutorial);
      } else if (event.code === KEYCODE.O && event.altKey) {
        event.preventDefault();
        clickPage(Page.Options);
      } else if (event.code === KEYCODE.B && event.altKey && Player.bladeburner) {
        event.preventDefault();
        clickPage(Page.Bladeburner);
      } else if (event.code === KEYCODE.G && event.altKey && Player.gang) {
        event.preventDefault();
        clickPage(Page.Gang);
      }
    }

    document.addEventListener("keydown", handleShortcuts);
    return () => document.removeEventListener("keydown", handleShortcuts);
  }, []);

  const clickPage = useCallback(
    (page: Page) => {
      if (page === Page.Job) {
        Router.toJob(Locations[Object.keys(Player.jobs)[0]]);
      } else if (page == Page.ScriptEditor) {
        Router.toScriptEditor();
      } else if ((Object.values(SimplePage) as Page[]).includes(page)) {
        Router.toPage(page as SimplePage);
      } else {
        throw new Error("Can't handle click on Page " + page);
      }
      if (flash === page) {
        iTutorialNextStep();
      }
    },
    [flash],
  );

  const classes = useStyles();
  const [open, setOpen] = useState(Settings.IsSidebarOpened);
  const toggleDrawer = (): void =>
    setOpen((old) => {
      Settings.IsSidebarOpened = !old;
      return !old;
    });

  return (
    <Drawer open={open} anchor="left" variant="permanent">
      <ListItem classes={{ root: classes.listitem }} button onClick={toggleDrawer}>
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
      </ListItem>
      <Divider />
      <List>
        <ListItem classes={{ root: classes.listitem }} button onClick={() => setHackingOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "Hacking" : ""}>
              <ComputerIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>Hacking</Typography>} />
          {hackingOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItem>
        <Collapse in={hackingOpen} timeout="auto" unmountOnExit>
          <List>
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Terminal"}
              className={clsx({
                [classes.active]: props.page === Page.Terminal,
              })}
              onClick={() => clickPage(Page.Terminal)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Terminal" : ""}>
                  <LastPageIcon
                    color={flash === Page.Terminal ? "error" : props.page !== Page.Terminal ? "secondary" : "primary"}
                  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography
                  color={flash === Page.Terminal ? "error" : props.page !== Page.Terminal ? "secondary" : "primary"}
                >
                  Terminal
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Script Editor"}
              className={clsx({
                [classes.active]: props.page === Page.ScriptEditor,
              })}
              onClick={() => clickPage(Page.ScriptEditor)}
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
            </ListItem>
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Active Scripts"}
              className={clsx({
                [classes.active]: props.page === Page.ActiveScripts,
              })}
              onClick={() => clickPage(Page.ActiveScripts)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Active Scripts" : ""}>
                  <StorageIcon
                    color={
                      flash === Page.ActiveScripts
                        ? "error"
                        : props.page !== Page.ActiveScripts
                        ? "secondary"
                        : "primary"
                    }
                  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography
                  color={
                    flash === Page.ActiveScripts ? "error" : props.page !== Page.ActiveScripts ? "secondary" : "primary"
                  }
                >
                  Active Scripts
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem
              button
              key={"Create Program"}
              className={clsx({
                [classes.active]: props.page === Page.CreateProgram,
              })}
              onClick={() => clickPage(Page.CreateProgram)}
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
            </ListItem>
            {canStaneksGift && (
              <ListItem
                button
                key={"Staneks Gift"}
                className={clsx({
                  [classes.active]: props.page === Page.StaneksGift,
                })}
                onClick={() => clickPage(Page.StaneksGift)}
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
              </ListItem>
            )}
          </List>
        </Collapse>

        <Divider />
        <ListItem classes={{ root: classes.listitem }} button onClick={() => setCharacterOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "Character" : ""}>
              <AccountBoxIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>Character</Typography>} />
          {characterOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItem>
        <Collapse in={characterOpen} timeout="auto" unmountOnExit>
          <ListItem
            button
            key={"Stats"}
            className={clsx({
              [classes.active]: props.page === Page.Stats,
            })}
            onClick={() => clickPage(Page.Stats)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Stats" : ""}>
                <EqualizerIcon
                  color={flash === Page.Stats ? "error" : props.page !== Page.Stats ? "secondary" : "primary"}
                />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={flash === Page.Stats ? "error" : props.page !== Page.Stats ? "secondary" : "primary"}>
                Stats
              </Typography>
            </ListItemText>
          </ListItem>
          {canOpenFactions && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Factions"}
              className={clsx({
                [classes.active]: [Page.Factions, Page.Faction].includes(props.page),
              })}
              onClick={() => clickPage(Page.Factions)}
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
            </ListItem>
          )}
          {canOpenAugmentations && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Augmentations"}
              className={clsx({
                [classes.active]: props.page === Page.Augmentations,
              })}
              onClick={() => clickPage(Page.Augmentations)}
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
            </ListItem>
          )}
          <ListItem
            button
            key={"Hacknet"}
            className={clsx({
              [classes.active]: props.page === Page.Hacknet,
            })}
            onClick={() => clickPage(Page.Hacknet)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Hacknet" : ""}>
                <AccountTreeIcon
                  color={flash === Page.Hacknet ? "error" : props.page !== Page.Hacknet ? "secondary" : "primary"}
                />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography
                color={flash === Page.Hacknet ? "error" : props.page !== Page.Hacknet ? "secondary" : "primary"}
              >
                Hacknet
              </Typography>
            </ListItemText>
          </ListItem>
          {canOpenSleeves && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Sleeves"}
              className={clsx({
                [classes.active]: props.page === Page.Sleeves,
              })}
              onClick={() => clickPage(Page.Sleeves)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Sleeves" : ""}>
                  <PeopleAltIcon color={props.page !== Page.Sleeves ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Sleeves ? "secondary" : "primary"}>Sleeves</Typography>
              </ListItemText>
            </ListItem>
          )}
        </Collapse>

        <Divider />
        <ListItem classes={{ root: classes.listitem }} button onClick={() => setWorldOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "World" : ""}>
              <PublicIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>World</Typography>} />
          {worldOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItem>
        <Collapse in={worldOpen} timeout="auto" unmountOnExit>
          <ListItem
            button
            key={"City"}
            className={clsx({
              [classes.active]:
                props.page === Page.City || props.page === Page.Grafting || props.page === Page.Location,
            })}
            onClick={() => clickPage(Page.City)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "City" : ""}>
                <LocationCityIcon
                  color={flash === Page.City ? "error" : props.page !== Page.City ? "secondary" : "primary"}
                />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={flash === Page.City ? "error" : props.page !== Page.City ? "secondary" : "primary"}>
                City
              </Typography>
            </ListItemText>
          </ListItem>
          <ListItem
            button
            key={"Travel"}
            className={clsx({
              [classes.active]: props.page === Page.Travel,
            })}
            onClick={() => clickPage(Page.Travel)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Travel" : ""}>
                <AirplanemodeActiveIcon color={props.page !== Page.Travel ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Travel ? "secondary" : "primary"}>Travel</Typography>
            </ListItemText>
          </ListItem>
          {canJob && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Job"}
              className={clsx({
                [classes.active]: props.page === Page.Job,
              })}
              onClick={() => clickPage(Page.Job)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Job" : ""}>
                  <WorkIcon color={props.page !== Page.Job ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Job ? "secondary" : "primary"}>Job</Typography>
              </ListItemText>
            </ListItem>
          )}
          {canStockMarket && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Stock Market"}
              className={clsx({
                [classes.active]: props.page === Page.StockMarket,
              })}
              onClick={() => clickPage(Page.StockMarket)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Stock Market" : ""}>
                  <TrendingUpIcon color={props.page !== Page.StockMarket ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.StockMarket ? "secondary" : "primary"}>Stock Market</Typography>
              </ListItemText>
            </ListItem>
          )}
          {canBladeburner && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Bladeburner"}
              className={clsx({
                [classes.active]: props.page === Page.Bladeburner,
              })}
              onClick={() => clickPage(Page.Bladeburner)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Bladeburner" : ""}>
                  <FormatBoldIcon color={props.page !== Page.Bladeburner ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Bladeburner ? "secondary" : "primary"}>Bladeburner</Typography>
              </ListItemText>
            </ListItem>
          )}
          {canCorporation && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Corp"}
              className={clsx({
                [classes.active]: props.page === Page.Corporation,
              })}
              onClick={() => clickPage(Page.Corporation)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Corp" : ""}>
                  <BusinessIcon color={props.page !== Page.Corporation ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Corporation ? "secondary" : "primary"}>Corp</Typography>
              </ListItemText>
            </ListItem>
          )}
          {canGang && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Gang"}
              className={clsx({
                [classes.active]: props.page === Page.Gang,
              })}
              onClick={() => clickPage(Page.Gang)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Gang" : ""}>
                  <SportsMmaIcon color={props.page !== Page.Gang ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.Gang ? "secondary" : "primary"}>Gang</Typography>
              </ListItemText>
            </ListItem>
          )}
        </Collapse>

        <Divider />
        <ListItem classes={{ root: classes.listitem }} button onClick={() => setHelpOpen((old) => !old)}>
          <ListItemIcon>
            <Tooltip title={!open ? "Help" : ""}>
              <LiveHelpIcon color="primary" />
            </Tooltip>
          </ListItemIcon>
          <ListItemText primary={<Typography>Help</Typography>} />
          {helpOpen ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
        </ListItem>
        <Collapse in={helpOpen} timeout="auto" unmountOnExit>
          <ListItem
            button
            key={"Milestones"}
            className={clsx({
              [classes.active]: props.page === Page.Milestones,
            })}
            onClick={() => clickPage(Page.Milestones)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Milestones" : ""}>
                <CheckIcon color={props.page !== Page.Milestones ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Milestones ? "secondary" : "primary"}>Milestones</Typography>
            </ListItemText>
          </ListItem>
          <ListItem
            button
            key={"Tutorial"}
            className={clsx({
              [classes.active]: props.page === Page.Tutorial,
            })}
            onClick={() => clickPage(Page.Tutorial)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Tutorial" : ""}>
                <HelpIcon
                  color={flash === Page.Tutorial ? "error" : props.page !== Page.Tutorial ? "secondary" : "primary"}
                />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography
                color={flash === Page.Tutorial ? "error" : props.page !== Page.Tutorial ? "secondary" : "primary"}
              >
                Tutorial
              </Typography>
            </ListItemText>
          </ListItem>
          <ListItem
            button
            key={"Achievements"}
            className={clsx({
              [classes.active]: props.page === Page.Achievements,
            })}
            onClick={() => clickPage(Page.Achievements)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Achievements" : ""}>
                <EmojiEventsIcon color={props.page !== Page.Achievements ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Achievements ? "secondary" : "primary"}>Achievements</Typography>
            </ListItemText>
          </ListItem>
          <ListItem
            button
            key={"Options"}
            className={clsx({
              [classes.active]: props.page === Page.Options,
            })}
            onClick={() => clickPage(Page.Options)}
          >
            <ListItemIcon>
              <Tooltip title={!open ? "Options" : ""}>
                <SettingsIcon color={props.page !== Page.Options ? "secondary" : "primary"} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText>
              <Typography color={props.page !== Page.Options ? "secondary" : "primary"}>Options</Typography>
            </ListItemText>
          </ListItem>
          {process.env.NODE_ENV === "development" && (
            <ListItem
              classes={{ root: classes.listitem }}
              button
              key={"Dev"}
              className={clsx({
                [classes.active]: props.page === Page.DevMenu,
              })}
              onClick={() => clickPage(Page.DevMenu)}
            >
              <ListItemIcon>
                <Tooltip title={!open ? "Dev" : ""}>
                  <DeveloperBoardIcon color={props.page !== Page.DevMenu ? "secondary" : "primary"} />
                </Tooltip>
              </ListItemIcon>
              <ListItemText>
                <Typography color={props.page !== Page.DevMenu ? "secondary" : "primary"}>Dev</Typography>
              </ListItemText>
            </ListItem>
          )}
        </Collapse>
      </List>
    </Drawer>
  );
}
