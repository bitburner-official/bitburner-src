import React, { useState, useEffect } from "react";

import { Player } from "@player";
import { installAugmentations } from "../Augmentation/AugmentationHelpers";
import { saveObject } from "../SaveObject";
import { onExport } from "../ExportBonus";
import { LocationName } from "../Enums";
import { Location } from "../Locations/Location";
import { ITutorial, iTutorialStart } from "../InteractiveTutorial";
import { InteractiveTutorialRoot } from "./InteractiveTutorial/InteractiveTutorialRoot";
import { ITutorialEvents } from "./InteractiveTutorial/ITutorialEvents";

import { Faction } from "../Faction/Faction";
import { prestigeAugmentation } from "../Prestige";
import { dialogBoxCreate } from "./React/DialogBox";
import { GetAllServers } from "../Server/AllServers";
import { Factions } from "../Faction/Factions";
import { StockMarket } from "../StockMarket/StockMarket";

import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Page, SimplePage, IRouter, ScriptEditorRouteOptions } from "./Router";
import { Overview } from "./React/Overview";
import { SidebarRoot } from "../Sidebar/ui/SidebarRoot";
import { AugmentationsRoot } from "../Augmentation/ui/AugmentationsRoot";
import { DevMenuRoot } from "../DevMenu";
import { BladeburnerRoot } from "../Bladeburner/ui/BladeburnerRoot";
import { GangRoot } from "../Gang/ui/GangRoot";
import { CorporationRoot } from "../Corporation/ui/CorporationRoot";
import { InfiltrationRoot } from "../Infiltration/ui/InfiltrationRoot";
import { GraftingRoot } from "../PersonObjects/Grafting/ui/GraftingRoot";
import { WorkInProgressRoot } from "./WorkInProgressRoot";
import { GameOptionsRoot } from "../GameOptions/ui/GameOptionsRoot";
import { SleeveRoot } from "../PersonObjects/Sleeve/ui/SleeveRoot";
import { HacknetRoot } from "../Hacknet/ui/HacknetRoot";
import { GenericLocation } from "../Locations/ui/GenericLocation";
import { LocationCity } from "../Locations/ui/City";
import { ProgramsRoot } from "../Programs/ui/ProgramsRoot";
import { Root as ScriptEditorRoot } from "../ScriptEditor/ui/ScriptEditorRoot";
import { MilestonesRoot } from "../Milestones/ui/MilestonesRoot";
import { TerminalRoot } from "../Terminal/ui/TerminalRoot";
import { TutorialRoot } from "../Tutorial/ui/TutorialRoot";
import { ActiveScriptsRoot } from "./ActiveScripts/ActiveScriptsRoot";
import { FactionsRoot } from "../Faction/ui/FactionsRoot";
import { FactionRoot } from "../Faction/ui/FactionRoot";
import { CharacterStats } from "./CharacterStats";
import { TravelAgencyRoot } from "../Locations/ui/TravelAgencyRoot";
import { StockMarketRoot } from "../StockMarket/ui/StockMarketRoot";
import { BitverseRoot } from "../BitNode/ui/BitverseRoot";
import { StaneksGiftRoot } from "../CotMG/ui/StaneksGiftRoot";
import { staneksGift } from "../CotMG/Helper";
import { CharacterOverview } from "./React/CharacterOverview";
import { BladeburnerCinematic } from "../Bladeburner/ui/BladeburnerCinematic";
import { workerScripts } from "../Netscript/WorkerScripts";
import { Unclickable } from "../Exploits/Unclickable";
import { Snackbar, SnackbarProvider } from "./React/Snackbar";
import { LogBoxManager } from "./React/LogBoxManager";
import { AlertManager } from "./React/AlertManager";
import { PromptManager } from "./React/PromptManager";
import { InvitationModal } from "../Faction/ui/InvitationModal";
import { calculateAchievements } from "../Achievements/Achievements";

import { RecoveryMode, RecoveryRoot } from "./React/RecoveryRoot";
import { AchievementsRoot } from "../Achievements/AchievementsRoot";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeBrowser } from "../Themes/ui/ThemeBrowser";
import { ImportSaveRoot } from "./React/ImportSaveRoot";
import { BypassWrapper } from "./React/BypassWrapper";

import _wrap from "lodash/wrap";
import _functions from "lodash/functions";
import { Apr1 } from "./Apr1";
import { isFactionWork } from "../Work/FactionWork";
import { V2Modal } from "../utils/V2Modal";
import { MathJaxContext } from "better-react-mathjax";

const htmlLocation = location;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "-ms-overflow-style": "none" /* for Internet Explorer, Edge */,
      "scrollbar-width": "none" /* for Firefox */,
      margin: theme.spacing(0),
      flexGrow: 1,
      padding: "8px",
      minHeight: "100vh",
      boxSizing: "border-box",
      width: "1px",
    },
  }),
);

const uninitialized = (): void => {
  throw new Error("Router called before initialization");
};

export let Router: IRouter = {
  isInitialized: false,
  page: () => {
    throw new Error("Router called before initialization");
  },
  allowRouting: uninitialized,
  toPage: () => {
    throw new Error("Router called before initialization");
  },
  toBitVerse: uninitialized,
  toFaction: uninitialized,
  toInfiltration: uninitialized,
  toJob: uninitialized,
  toScriptEditor: uninitialized,
  toLocation: uninitialized,
  toImportSave: uninitialized,
};

function determineStartPage(): Page {
  if (RecoveryMode) return Page.Recovery;
  if (Player.currentWork !== null) return Page.Work;
  return Page.Terminal;
}

export function GameRoot(): React.ReactElement {
  const classes = useStyles();
  const [{ files, vim }, setEditorOptions] = useState({ files: {}, vim: false });
  const [page, setPage] = useState(determineStartPage());
  const setRerender = useState(0)[1];
  const [augPage, setAugPage] = useState<boolean>(false);
  const [faction, setFaction] = useState<Faction>(
    isFactionWork(Player.currentWork) ? Factions[Player.currentWork.factionName] : (undefined as unknown as Faction),
  );
  if (faction === undefined && page === Page.Faction)
    throw new Error("Trying to go to a page without the proper setup");

  const [flume, setFlume] = useState<boolean>(false);
  const [quick, setQuick] = useState<boolean>(false);
  const [location, setLocation] = useState<Location>(undefined as unknown as Location);
  if (location === undefined && (page === Page.Infiltration || page === Page.Location || page === Page.Job))
    throw new Error("Trying to go to a page without the proper setup");

  const [cinematicText, setCinematicText] = useState("");
  const [errorBoundaryKey, setErrorBoundaryKey] = useState<number>(0);

  const [importString, setImportString] = useState<string>(undefined as unknown as string);
  const [importAutomatic, setImportAutomatic] = useState<boolean>(false);
  if (importString === undefined && page === Page.ImportSave)
    throw new Error("Trying to go to a page without the proper setup");

  const [allowRoutingCalls, setAllowRoutingCalls] = useState(true);

  function resetErrorBoundary(): void {
    setErrorBoundaryKey(errorBoundaryKey + 1);
  }

  function rerender(): void {
    setRerender((old) => old + 1);
  }
  useEffect(() => {
    return ITutorialEvents.subscribe(rerender);
  }, []);

  function killAllScripts(): void {
    for (const server of GetAllServers()) {
      server.runningScripts = [];
    }
    saveObject.saveGame();
    setTimeout(() => htmlLocation.reload(), 2000);
  }

  Router = {
    isInitialized: true,
    page: () => page,
    allowRouting: (value: boolean) => setAllowRoutingCalls(value),
    toPage: (page: SimplePage) => {
      switch (page) {
        case Page.Travel:
          Player.gotoLocation(LocationName.TravelAgency);
          break;
        case Page.BladeburnerCinematic:
          setPage(page);
          setCinematicText(cinematicText);
          return;
      }
      setPage(page);
    },
    toFaction: (faction: Faction, augPage = false) => {
      setAugPage(augPage);
      setPage(Page.Faction);
      if (faction) setFaction(faction);
    },
    toScriptEditor: (files: Record<string, string>, options?: ScriptEditorRouteOptions) => {
      setEditorOptions({
        files,
        vim: !!options?.vim,
      });
      setPage(Page.ScriptEditor);
    },
    toJob: (location: Location) => {
      setLocation(location);
      setPage(Page.Job);
    },
    toBitVerse: (flume: boolean, quick: boolean) => {
      setFlume(flume);
      setQuick(quick);
      calculateAchievements();
      setPage(Page.BitVerse);
    },
    toInfiltration: (location: Location) => {
      setLocation(location);
      setPage(Page.Infiltration);
    },
    toLocation: (location: Location) => {
      setLocation(location);
      setPage(Page.Location);
    },
    toImportSave: (base64save: string, automatic = false) => {
      setImportString(base64save);
      setImportAutomatic(automatic);
      setPage(Page.ImportSave);
    },
  };

  useEffect(() => {
    // Wrap Router navigate functions to be able to disable the execution
    _functions(Router)
      .filter((fnName) => fnName.startsWith("to"))
      .forEach((fnName) => {
        // @ts-ignore - tslint does not like this, couldn't find a way to make it cooperate
        Router[fnName] = _wrap(Router[fnName], (func, ...args) => {
          if (!allowRoutingCalls) {
            // Let's just log to console.
            console.error(`Routing is currently disabled - Attempted router.${fnName}()`);
            return;
          }

          // Call the function normally
          return func(...args);
        });
      });
  });

  useEffect(() => {
    if (page !== Page.Terminal) window.scrollTo(0, 0);
  });

  function softReset(): void {
    dialogBoxCreate("Soft Reset!");
    installAugmentations(true);
    resetErrorBoundary();
    Router.toPage(Page.Terminal);
  }

  let mainPage = <Typography>Cannot load</Typography>;
  let withSidebar = true;
  let withPopups = true;
  let bypassGame = false;
  switch (page) {
    case Page.Recovery: {
      mainPage = <RecoveryRoot softReset={softReset} />;
      withSidebar = false;
      withPopups = false;
      bypassGame = true;
      break;
    }
    case Page.BitVerse: {
      mainPage = <BitverseRoot flume={flume} quick={quick} />;
      withSidebar = false;
      withPopups = false;
      break;
    }
    case Page.Infiltration: {
      mainPage = <InfiltrationRoot location={location} />;
      withSidebar = false;
      withPopups = false;
      break;
    }
    case Page.BladeburnerCinematic: {
      mainPage = <BladeburnerCinematic />;
      withSidebar = false;
      withPopups = false;
      break;
    }
    case Page.Work: {
      mainPage = <WorkInProgressRoot />;
      withSidebar = false;
      break;
    }
    case Page.Terminal: {
      mainPage = <TerminalRoot />;
      break;
    }
    case Page.Sleeves: {
      mainPage = <SleeveRoot />;
      break;
    }
    case Page.StaneksGift: {
      mainPage = <StaneksGiftRoot staneksGift={staneksGift} />;
      break;
    }
    case Page.Stats: {
      mainPage = <CharacterStats />;
      break;
    }
    case Page.ScriptEditor: {
      mainPage = <ScriptEditorRoot files={files} hostname={Player.getCurrentServer().hostname} vim={vim} />;
      break;
    }
    case Page.ActiveScripts: {
      mainPage = <ActiveScriptsRoot workerScripts={workerScripts} />;
      break;
    }
    case Page.Hacknet: {
      mainPage = <HacknetRoot />;
      break;
    }
    case Page.CreateProgram: {
      mainPage = <ProgramsRoot />;
      break;
    }
    case Page.Factions: {
      mainPage = <FactionsRoot />;
      break;
    }
    case Page.Faction: {
      mainPage = <FactionRoot faction={faction} augPage={augPage} />;
      break;
    }
    case Page.Milestones: {
      mainPage = <MilestonesRoot />;
      break;
    }
    case Page.Tutorial: {
      mainPage = (
        <TutorialRoot
          reactivateTutorial={() => {
            prestigeAugmentation();
            Router.toPage(Page.Terminal);
            iTutorialStart();
          }}
        />
      );
      break;
    }
    case Page.DevMenu: {
      mainPage = <DevMenuRoot />;
      break;
    }
    case Page.Gang: {
      mainPage = <GangRoot />;
      break;
    }
    case Page.Corporation: {
      mainPage = <CorporationRoot />;
      break;
    }
    case Page.Bladeburner: {
      mainPage = <BladeburnerRoot />;
      break;
    }
    case Page.Grafting: {
      mainPage = <GraftingRoot />;
      break;
    }
    case Page.Travel: {
      mainPage = <TravelAgencyRoot />;
      break;
    }
    case Page.StockMarket: {
      mainPage = <StockMarketRoot stockMarket={StockMarket} />;
      break;
    }
    case Page.City: {
      mainPage = <LocationCity />;
      break;
    }
    case Page.Job:
    case Page.Location: {
      mainPage = <GenericLocation loc={location} />;
      break;
    }
    case Page.Options: {
      mainPage = (
        <GameOptionsRoot
          save={() => saveObject.saveGame()}
          export={() => {
            // Apply the export bonus before saving the game
            onExport();
            saveObject.exportGame();
          }}
          forceKill={killAllScripts}
          softReset={softReset}
        />
      );
      break;
    }
    case Page.Augmentations: {
      mainPage = (
        <AugmentationsRoot
          exportGameFn={() => {
            // Apply the export bonus before saving the game
            onExport();
            saveObject.exportGame();
          }}
          installAugmentationsFn={() => {
            installAugmentations();
          }}
        />
      );
      break;
    }
    case Page.Achievements: {
      mainPage = <AchievementsRoot />;
      break;
    }
    case Page.ThemeBrowser: {
      mainPage = <ThemeBrowser />;
      break;
    }
    case Page.ImportSave: {
      mainPage = <ImportSaveRoot importString={importString} automatic={importAutomatic} />;
      withSidebar = false;
      withPopups = false;
      bypassGame = true;
    }
  }

  return (
    <MathJaxContext>
      <ErrorBoundary key={errorBoundaryKey} softReset={softReset}>
        <BypassWrapper content={bypassGame ? mainPage : null}>
          <SnackbarProvider>
            <Overview mode={ITutorial.isRunning ? "tutorial" : "overview"}>
              {(parentOpen) =>
                !ITutorial.isRunning ? (
                  <CharacterOverview
                    parentOpen={parentOpen}
                    save={() => saveObject.saveGame()}
                    killScripts={killAllScripts}
                  />
                ) : (
                  <InteractiveTutorialRoot />
                )
              }
            </Overview>
            {withSidebar ? (
              <Box display="flex" flexDirection="row" width="100%">
                <SidebarRoot page={page} />
                <Box className={classes.root}>{mainPage}</Box>
              </Box>
            ) : (
              <Box className={classes.root}>{mainPage}</Box>
            )}
            <Unclickable />
            {withPopups && (
              <>
                <LogBoxManager />
                <AlertManager />
                <PromptManager />
                <InvitationModal />
                <Snackbar />
              </>
            )}
            <Apr1 />
          </SnackbarProvider>
        </BypassWrapper>
      </ErrorBoundary>
      <V2Modal />
    </MathJaxContext>
  );
}
