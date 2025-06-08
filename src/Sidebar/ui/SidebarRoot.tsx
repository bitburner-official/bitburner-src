import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
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

import ComputerIcon from "@mui/icons-material/Computer"; // Hacking
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
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard"; // Stanek + Dev
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Achievements
import AccountBoxIcon from "@mui/icons-material/AccountBox"; // Character
import PublicIcon from "@mui/icons-material/Public"; // World
import LiveHelpIcon from "@mui/icons-material/LiveHelp"; // Help
import BorderInnerSharpIcon from "@mui/icons-material/BorderInnerSharp"; // IPvGO
import BiotechIcon from "@mui/icons-material/Biotech"; // Grafting

import { Router } from "../../ui/GameRoot";
import { ComplexPage, SimplePage } from "../../ui/Enums";
import { Page, isSimplePage } from "../../ui/Router";
import { SidebarAccordion } from "./SidebarAccordion";
import { Player } from "@player";
import { CONSTANTS } from "../../Constants";
import { iTutorialSteps, iTutorialNextStep, ITutorial } from "../../InteractiveTutorial";
import { getAvailableCreatePrograms } from "../../Programs/ProgramHelpers";
import { Settings } from "../../Settings/Settings";
import { AugmentationName, CityName } from "@enums";

import { ProgramsSeen } from "../../Programs/ui/ProgramsRoot";
import { InvitationsSeen } from "../../Faction/ui/FactionsRoot";
import { commitHash } from "../../utils/helpers/commitHash";
import { useCycleRerender } from "../../ui/React/hooks";
import { playerHasDiscoveredGo } from "../../Go/effects/effect";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";
import {
  convertKeyboardEventToKeyCombination,
  determineKeyBindingTypes,
  type GoToPageKeyBindingType,
  KeyBindingEvents,
  KeyBindingEventType,
  ScriptEditorAction,
  type KeyBindingType,
  CurrentKeyBindings,
} from "../../utils/KeyBindingUtils";
import { throwIfReachable } from "../../utils/helpers/throwIfReachable";
import { ErrorState } from "../../ErrorHandling/ErrorState";

const RotatedDoubleArrowIcon = React.forwardRef(function RotatedDoubleArrowIcon(
  props: { color: "primary" | "secondary" | "error" },
  __ref: React.ForwardedRef<SVGSVGElement>,
) {
  return <DoubleArrowIcon {...props} style={{ transform: "rotate(-90deg)" }} ref={__ref} />;
});

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

const useStyles = makeStyles()((theme: Theme) => ({
  active: {
    borderLeft: "3px solid " + theme.palette.primary.main,
  },
  listitem: {},
}));

export function SidebarRoot(props: { page: Page }): React.ReactElement {
  const isSettingUpKeyBindings = useRef(false);
  useCycleRerender();

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
      flash = Page.Documentation;
      break;
  }

  const augmentationCount = Player.queuedAugmentations.length;
  const invitationsCount = Player.factionInvitations.filter((f) => !InvitationsSeen.has(f)).length;
  const programCount = getAvailableCreatePrograms().length - ProgramsSeen.size;
  const errorCount = ErrorState.UnreadErrors;

  const canOpenFactions =
    Player.factionInvitations.length > 0 ||
    Player.factions.length > 0 ||
    Player.augmentations.length > 0 ||
    Player.queuedAugmentations.length > 0 ||
    knowAboutBitverse();

  const canOpenAugmentations =
    Player.augmentations.length > 0 ||
    Player.queuedAugmentations.length > 0 ||
    knowAboutBitverse() ||
    Player.exploits.length > 0;

  const canOpenSleeves = Player.sleeves.length > 0;
  const canOpenGrafting = Player.canAccessGrafting() && Player.city === CityName.NewTokyo;

  const canCorporation = !!Player.corporation;
  const canGang = !!Player.gang;
  const canJob = Object.values(Player.jobs).length > 0;
  const canStockMarket = Player.hasWseAccount;
  const canBladeburner = !!Player.bladeburner;
  const canStaneksGift = Player.augmentations.some((aug) => aug.name === AugmentationName.StaneksGift1);
  const canIPvGO = playerHasDiscoveredGo();

  const clickPage = useCallback(
    (page: Page) => {
      if (page == Page.ScriptEditor || page == Page.Documentation) {
        Router.toPage(page, {});
      } else if (isSimplePage(page)) {
        Router.toPage(page);
      } else {
        throw new Error("Can't handle click on Page " + page);
      }
      if (flash === page) {
        iTutorialNextStep();
      }
    },
    [flash],
  );

  /**
   * We use "keyBindingType is GoToPageKeyBindingType" to narrow down the type of keyBindingType.
   */
  const canGoToPage = useCallback(
    (keyBindingType: KeyBindingType): keyBindingType is GoToPageKeyBindingType => {
      switch (keyBindingType) {
        case SimplePage.Terminal:
        case ComplexPage.ScriptEditor:
        case SimplePage.ActiveScripts:
        case SimplePage.CreateProgram:
        case SimplePage.Stats:
        case SimplePage.Hacknet:
        case SimplePage.City:
        case SimplePage.Travel:
        case SimplePage.Milestones:
        case ComplexPage.Documentation:
        case SimplePage.Achievements:
        case SimplePage.Options:
          return true;
        case SimplePage.StaneksGift:
          return canStaneksGift;
        case SimplePage.Factions:
          return canOpenFactions;
        case SimplePage.Augmentations:
          return canOpenAugmentations;
        case SimplePage.Sleeves:
          return canOpenSleeves;
        case SimplePage.Grafting:
          return canOpenGrafting;
        case SimplePage.Job:
          return canJob;
        case SimplePage.StockMarket:
          return canStockMarket;
        case SimplePage.Bladeburner:
          return canBladeburner;
        case SimplePage.Corporation:
          return canCorporation;
        case SimplePage.Gang:
          return canGang;
        case SimplePage.Go:
          return canIPvGO;
        case ScriptEditorAction.Save:
        case ScriptEditorAction.GoToTerminal:
        case ScriptEditorAction.Run:
          return false;
        default:
          throwIfReachable(keyBindingType);
      }
      return false;
    },
    [
      canStaneksGift,
      canOpenFactions,
      canOpenAugmentations,
      canOpenSleeves,
      canOpenGrafting,
      canJob,
      canStockMarket,
      canBladeburner,
      canCorporation,
      canGang,
      canIPvGO,
    ],
  );

  useEffect(() => {
    const clearSubscription = KeyBindingEvents.subscribe((eventType) => {
      if (eventType === KeyBindingEventType.StartSettingUp) {
        isSettingUpKeyBindings.current = true;
      }
      if (eventType === KeyBindingEventType.StopSettingUp) {
        isSettingUpKeyBindings.current = false;
      }
    });
    return clearSubscription;
  }, []);

  useEffect(() => {
    function handleShortcuts(this: Document, event: KeyboardEvent): void {
      if (Settings.DisableHotkeys) {
        return;
      }
      if (event.getModifierState(event.key)) {
        return;
      }
      if (isSettingUpKeyBindings.current) {
        return;
      }
      if ((Player.currentWork && Player.focus) || Router.page() === Page.BitVerse) {
        return;
      }
      const keyBindingTypes = determineKeyBindingTypes(CurrentKeyBindings, convertKeyboardEventToKeyCombination(event));
      for (const keyBindingType of keyBindingTypes) {
        if (!canGoToPage(keyBindingType)) {
          continue;
        }
        event.preventDefault();
        clickPage(keyBindingType);
      }
    }

    document.addEventListener("keydown", handleShortcuts);
    return () => document.removeEventListener("keydown", handleShortcuts);
  }, [canGoToPage, clickPage, props.page]);

  const { classes } = useStyles();
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
                <Tooltip title={commitHash()}>
                  <Typography>Bitburner v{CONSTANTS.VersionString}</Typography>
                </Tooltip>
              }
            />
          </ListItem>
        ),
        [ChevronOpenClose, li_classes],
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
            {
              key_: Page.ActiveScripts,
              icon: StorageIcon,
              count: errorCount,
              alternateKeys: [Page.RecentErrors, Page.RecentlyKilledScripts],
            },
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
              active: [Page.Factions, Page.Faction].includes(props.page),
              count: invitationsCount,
            },
            canOpenAugmentations && {
              key_: Page.Augmentations,
              icon: RotatedDoubleArrowIcon,
              count: augmentationCount,
            },
            { key_: Page.Hacknet, icon: AccountTreeIcon },
            canOpenSleeves && { key_: Page.Sleeves, icon: PeopleAltIcon },
            canOpenGrafting && { key_: Page.Grafting, icon: BiotechIcon },
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
              active: [Page.City, Page.Location].includes(props.page),
            },
            { key_: Page.Travel, icon: AirplanemodeActiveIcon },
            canJob && { key_: Page.Job, icon: WorkIcon },
            canStockMarket && { key_: Page.StockMarket, icon: TrendingUpIcon },
            canBladeburner && { key_: Page.Bladeburner, icon: FormatBoldIcon },
            canCorporation && { key_: Page.Corporation, icon: BusinessIcon },
            canGang && { key_: Page.Gang, icon: SportsMmaIcon },
            canIPvGO && { key_: Page.Go, icon: BorderInnerSharpIcon },
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
            { key_: Page.Documentation, icon: HelpIcon },
            { key_: Page.Achievements, icon: EmojiEventsIcon },
            { key_: Page.Options, icon: SettingsIcon },
            process.env.NODE_ENV === "development" && { key_: Page.DevMenu, icon: DeveloperBoardIcon },
          ]}
        />
      </List>
    </Drawer>
  );
}
