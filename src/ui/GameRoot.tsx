import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

import { Player } from "@player";
import { installAugmentations } from "../Augmentation/AugmentationHelpers";
import { saveObject } from "../SaveObject";
import { onExport } from "../ExportBonus";
import { LocationName } from "@enums";
import { ITutorial, iTutorialStart } from "../InteractiveTutorial";
import { InteractiveTutorialRoot } from "./InteractiveTutorial/InteractiveTutorialRoot";
import { ITutorialEvents } from "./InteractiveTutorial/ITutorialEvents";

import { prestigeAugmentation } from "../Prestige";
import { prestigeWorkerScripts } from "../NetscriptWorker";
import { dialogBoxCreate } from "./React/DialogBox";
import { GetAllServers } from "../Server/AllServers";
import { StockMarket } from "../StockMarket/StockMarket";

import { Page, PageWithContext, IRouter, ComplexPage, PageContext } from "./Router";
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
import { ScriptEditorRoot } from "../ScriptEditor/ui/ScriptEditorRoot";
import { MilestonesRoot } from "../Milestones/ui/MilestonesRoot";
import { TerminalRoot } from "../Terminal/ui/TerminalRoot";
import { DocumentationRoot } from "../Documentation/ui/DocumentationRoot";
import { ActiveScriptsRoot } from "./ActiveScripts/ActiveScriptsRoot";
import { FactionsRoot } from "../Faction/ui/FactionsRoot";
import { FactionRoot } from "../Faction/ui/FactionRoot";
import { AugmentationsPage as FactionAugmentations } from "../Faction/ui/AugmentationsPage";
import { CharacterStats } from "./CharacterStats";
import { TravelAgencyRoot } from "../Locations/ui/TravelAgencyRoot";
import { StockMarketRoot } from "../StockMarket/ui/StockMarketRoot";
import { BitverseRoot } from "../BitNode/ui/BitverseRoot";
import { StaneksGiftRoot } from "../CotMG/ui/StaneksGiftRoot";
import { staneksGift } from "../CotMG/Helper";
import { CharacterOverview } from "./React/CharacterOverview";
import { BladeburnerCinematic } from "../Bladeburner/ui/BladeburnerCinematic";
import { Unclickable } from "../Exploits/Unclickable";
import { Snackbar, SnackbarProvider } from "./React/Snackbar";
import { LogBoxManager } from "./React/LogBoxManager";
import { AlertManager } from "./React/AlertManager";
import { PromptManager } from "./React/PromptManager";
import { FactionInvitationManager } from "../Faction/ui/FactionInvitationManager";
import { calculateAchievements } from "../Achievements/Achievements";

import { RecoveryMode, RecoveryRoot } from "./React/RecoveryRoot";
import { AchievementsRoot } from "../Achievements/AchievementsRoot";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeBrowser } from "../Themes/ui/ThemeBrowser";
import { ImportSave } from "./React/ImportSave";
import { BypassWrapper } from "./React/BypassWrapper";

import { Apr1 } from "./Apr1";
import { V2Modal } from "../utils/V2Modal";
import { MathJaxContext } from "better-react-mathjax";
import { useRerender } from "./React/hooks";
import { HistoryProvider } from "./React/Documentation";
import { GoRoot } from "../Go/ui/GoRoot";
import { Settings } from "../Settings/Settings";
import { isBitNodeFinished } from "../BitNode/BitNodeUtils";

const htmlLocation = location;

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    msOverflowStyle: "none" /* for Internet Explorer, Edge */,
    scrollbarWidth: "none" /* for Firefox */,
    margin: theme.spacing(0),
    flexGrow: 1,
    padding: "8px",
    minHeight: "100vh",
    boxSizing: "border-box",
    width: "1px",
  },
}));

const uninitialized = (): void => {
  throw new Error("Router called before initialization - uninitialized");
};

const MAX_PAGES_IN_HISTORY = 10;

export let Router: IRouter = {
  isInitialized: false,
  page: () => {
    throw new Error("Router called before initialization - page");
  },
  allowRouting: uninitialized,
  toPage: () => {
    throw new Error("Router called before initialization - toPage");
  },
  back: () => {
    throw new Error("Router called before initialization - back");
  },
};

function determineStartPage(): PageWithContext {
  if (RecoveryMode) {
    return { page: Page.Recovery };
  }
  if (isBitNodeFinished()) {
    // Go to BitVerse UI without animation.
    return { page: Page.BitVerse, flume: false, quick: true };
  }
  if (Player.currentWork !== null) {
    return { page: Page.Work };
  }
  return { page: Page.Terminal };
}

export function GameRoot(): React.ReactElement {
  const { classes } = useStyles();

  const [pages, setPages] = useState<PageWithContext[]>(() => [determineStartPage()]);
  const pageWithContext = pages[0];

  const setNextPage = (pageWithContext: PageWithContext) =>
    setPages((prev) => {
      const next = [pageWithContext, ...prev];
      next.length = Math.min(next.length, MAX_PAGES_IN_HISTORY);
      return next;
    });

  const rerender = useRerender();

  const [errorBoundaryKey, setErrorBoundaryKey] = useState<number>(0);

  const [allowRoutingCalls, setAllowRoutingCalls] = useState(true);

  function resetErrorBoundary(): void {
    setErrorBoundaryKey(errorBoundaryKey + 1);
  }

  useEffect(() => {
    return ITutorialEvents.subscribe(rerender);
  }, [rerender]);

  function killAllScripts(): void {
    for (const server of GetAllServers()) {
      server.runningScriptMap.clear();
    }
    saveObject.saveGame();
    setTimeout(() => htmlLocation.reload(), 2000);
  }

  function attemptedForbiddenRouting(name: string) {
    console.error(`Routing is currently disabled - Attempted router.${name}()`);
  }

  Router = {
    isInitialized: true,
    page: () => pageWithContext.page,
    allowRouting: (value: boolean) => setAllowRoutingCalls(value),
    toPage: (page: Page, context?: PageContext<ComplexPage>) => {
      if (!allowRoutingCalls) return attemptedForbiddenRouting("toPage");
      switch (page) {
        case Page.Travel:
          Player.gotoLocation(LocationName.TravelAgency);
          break;
        case Page.BitVerse:
          prestigeWorkerScripts();
          calculateAchievements();
          break;
      }
      setNextPage({ page, ...context } as PageWithContext);
    },
    back: () => {
      if (!allowRoutingCalls) return attemptedForbiddenRouting("back");
      setPages((pages) => pages.slice(1));
    },
  };

  useEffect(() => {
    if (pageWithContext.page !== Page.Terminal) window.scrollTo(0, 0);
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
  switch (pageWithContext.page) {
    case Page.Recovery: {
      mainPage = <RecoveryRoot softReset={softReset} />;
      withSidebar = false;
      withPopups = false;
      bypassGame = true;
      break;
    }
    case Page.BitVerse: {
      mainPage = <BitverseRoot flume={pageWithContext.flume} quick={pageWithContext.quick} />;
      withSidebar = false;
      withPopups = false;
      break;
    }
    case Page.Infiltration: {
      mainPage = <InfiltrationRoot location={pageWithContext.location} />;
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
      mainPage = (
        <ScriptEditorRoot
          files={pageWithContext.files ?? new Map()}
          hostname={pageWithContext.options?.hostname ?? Player.getCurrentServer().hostname}
          vim={pageWithContext.options === undefined ? Settings.MonacoDefaultToVim : pageWithContext.options.vim}
        />
      );
      break;
    }
    case Page.ActiveScripts: {
      mainPage = <ActiveScriptsRoot />;
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
      mainPage = <FactionRoot faction={pageWithContext.faction} />;
      break;
    }
    case Page.FactionAugmentations: {
      mainPage = <FactionAugmentations faction={pageWithContext.faction} />;
      break;
    }
    case Page.Milestones: {
      mainPage = <MilestonesRoot />;
      break;
    }
    case Page.Documentation: {
      mainPage = <DocumentationRoot docPage={pageWithContext.docPage} />;
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
      mainPage = <GenericLocation loc={pageWithContext.location} />;
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
          reactivateTutorial={() => {
            prestigeAugmentation();
            Router.toPage(Page.Terminal);
            iTutorialStart();
          }}
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
    case Page.Go: {
      mainPage = <GoRoot />;
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
      mainPage = <ImportSave saveData={pageWithContext.saveData} automatic={!!pageWithContext.automatic} />;
      withSidebar = false;
      withPopups = false;
      bypassGame = true;
    }
  }

  return (
    <MathJaxContext version={3} src={"dist/ext/MathJax-3.2.2/es5/tex-chtml.js"}>
      <ErrorBoundary key={errorBoundaryKey} softReset={softReset}>
        <BypassWrapper content={bypassGame ? mainPage : null}>
          <HistoryProvider>
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
                  <SidebarRoot page={pageWithContext.page} />
                  <Box className={classes.root}>{mainPage}</Box>
                </Box>
              ) : (
                <Box className={classes.root}>{mainPage}</Box>
              )}
              <Unclickable />
              <LogBoxManager hidden={!withPopups} />
              <AlertManager hidden={!withPopups} />
              <PromptManager hidden={!withPopups} />
              <FactionInvitationManager hidden={!withPopups} />
              <Snackbar hidden={!withPopups} />
              <Apr1 />
            </SnackbarProvider>
          </HistoryProvider>
        </BypassWrapper>
      </ErrorBoundary>
      <V2Modal />
    </MathJaxContext>
  );
}
