import React, { useCallback, useEffect, useMemo, useState } from "react";

// Achievements
import AccountBoxIcon from "@mui/icons-material/AccountBox";
// Augmentations
import AccountTreeIcon from "@mui/icons-material/AccountTree";
// City
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
// Active Scripts
import BugReportIcon from "@mui/icons-material/BugReport";
// Bladeburner
import BusinessIcon from "@mui/icons-material/Business";
// Gang
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ComputerIcon from "@mui/icons-material/Computer";
// Stats
import ContactsIcon from "@mui/icons-material/Contacts";
// Terminal
import CreateIcon from "@mui/icons-material/Create";
// options
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
// Factions
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
// Dev
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
// Create Program
import EqualizerIcon from "@mui/icons-material/Equalizer";
// Stock Market
import FormatBoldIcon from "@mui/icons-material/FormatBold";
// Milestones
import HelpIcon from "@mui/icons-material/Help";
import LastPageIcon from "@mui/icons-material/LastPage";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
// Sleeves
import LocationCityIcon from "@mui/icons-material/LocationCity";
// Hacknet
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PublicIcon from "@mui/icons-material/Public";
// Tutorial
import SettingsIcon from "@mui/icons-material/Settings";
// Corp
import SportsMmaIcon from "@mui/icons-material/SportsMma";
// Create Script
import StorageIcon from "@mui/icons-material/Storage";
// Job
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// Travel
import WorkIcon from "@mui/icons-material/Work";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { CSSObject, Theme, styled } from "@mui/material/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Player } from "@player";

import { AugmentationNames } from "../../Augmentation/data/AugmentationNames";
import { CONSTANTS } from "../../Constants";
import { InvitationsSeen } from "../../Faction/ui/FactionsRoot";
import { ITutorial, iTutorialNextStep, iTutorialSteps } from "../../InteractiveTutorial";
import { Locations } from "../../Locations/Locations";
import { getAvailableCreatePrograms } from "../../Programs/ProgramHelpers";
import { ProgramsSeen } from "../../Programs/ui/ProgramsRoot";
import { Settings } from "../../Settings/Settings";
import { hash } from "../../hash/hash";
import { Router } from "../../ui/GameRoot";
import { useRerender } from "../../ui/React/hooks";
import { Page, SimplePage } from "../../ui/Router";
import { KEYCODE } from "../../utils/helpers/keyCodes";
import { SidebarAccordion } from "./SidebarAccordion";

const RotatedDoubleArrowIcon = React.forwardRef((props: { color: "primary" | "secondary" | "error" }, __ref) => (
  <DoubleArrowIcon color={props.color} style={{ transform: "rotate(-90deg)" }} />
));

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
  useRerender(200);

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
    Player.sourceFiles.size > 0;

  const canOpenAugmentations =
    Player.augmentations.length > 0 ||
    Player.queuedAugmentations.length > 0 ||
    Player.sourceFiles.size > 0 ||
    Player.exploits.length > 0;

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
  const li_classes = useMemo(() => ({ root: classes.listitem }), [classes.listitem]);
  const ChevronOpenClose = open ? ChevronLeftIcon : ChevronRightIcon;

  // Explicitily useMemo() to save rerendering deep chunks of this tree.
  // memo() can't be (easily) used on components like <List>, because the
  // props.children array will be a different object every time.
  return (
    <Drawer open={open} anchor="left" variant="permanent">
      {useMemo(
        () => (
          <ListItem classes={li_classes} button onClick={toggleDrawer}>
            <ListItemIcon>
              <ChevronOpenClose color={"primary"} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Tooltip title={hash()}>
                  <Typography>Bitburner v{CONSTANTS.VersionString}</Typography>
                </Tooltip>
              }
            />
          </ListItem>
        ),
        [li_classes, open],
      )}
      <Divider />
      <List>
        <SidebarAccordion
          key_="Hacking"
          page={props.page}
          clickPage={clickPage}
          flash={flash}
          icon={ComputerIcon}
          sidebarOpen={open}
          classes={classes}
          items={[
            { key_: Page.Terminal, icon: LastPageIcon },
            { key_: Page.ScriptEditor, icon: CreateIcon },
            { key_: Page.ActiveScripts, icon: StorageIcon },
            { key_: Page.CreateProgram, icon: BugReportIcon, count: programCount },
            canStaneksGift && { key_: Page.StaneksGift, icon: DeveloperBoardIcon },
          ]}
        />
        <Divider />
        <SidebarAccordion
          key_="Character"
          page={props.page}
          clickPage={clickPage}
          flash={flash}
          icon={AccountBoxIcon}
          sidebarOpen={open}
          classes={classes}
          items={[
            { key_: Page.Stats, icon: EqualizerIcon },
            canOpenFactions && {
              key_: Page.Factions,
              icon: ContactsIcon,
              active: [Page.Factions as Page, Page.Faction].includes(props.page),
              count: invitationsCount,
            },
            canOpenAugmentations && {
              key_: Page.Augmentations,
              icon: RotatedDoubleArrowIcon,
              count: augmentationCount,
            },
            { key_: Page.Hacknet, icon: AccountTreeIcon },
            canOpenSleeves && { key_: Page.Sleeves, icon: PeopleAltIcon },
          ]}
        />
        <Divider />
        <SidebarAccordion
          key_="World"
          page={props.page}
          clickPage={clickPage}
          flash={flash}
          icon={PublicIcon}
          sidebarOpen={open}
          classes={classes}
          items={[
            {
              key_: Page.City,
              icon: LocationCityIcon,
              active: [Page.City as Page, Page.Grafting, Page.Location].includes(props.page),
            },
            { key_: Page.Travel, icon: AirplanemodeActiveIcon },
            canJob && { key_: Page.Job, icon: WorkIcon },
            canStockMarket && { key_: Page.StockMarket, icon: TrendingUpIcon },
            canBladeburner && { key_: Page.Bladeburner, icon: FormatBoldIcon },
            canCorporation && { key_: Page.Corporation, icon: BusinessIcon },
            canGang && { key_: Page.Gang, icon: SportsMmaIcon },
          ]}
        />
        <Divider />
        <SidebarAccordion
          key_="Help"
          page={props.page}
          clickPage={clickPage}
          flash={flash}
          icon={LiveHelpIcon}
          sidebarOpen={open}
          classes={classes}
          items={[
            { key_: Page.Milestones, icon: CheckIcon },
            { key_: Page.Tutorial, icon: HelpIcon },
            { key_: Page.Achievements, icon: EmojiEventsIcon },
            { key_: Page.Options, icon: SettingsIcon },
            process.env.NODE_ENV === "development" && { key_: Page.DevMenu, icon: DeveloperBoardIcon },
          ]}
        />
      </List>
    </Drawer>
  );
}
