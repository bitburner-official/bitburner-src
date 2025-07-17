import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

import { Player } from "@player";
import { installAugmentations } from "../Augmentation/AugmentationHelpers";
import { saveObject } from "../SaveObject";
import { CompletedProgramName, LocationName, SimplePage } from "@enums";
import { ITutorial, iTutorialStart } from "../InteractiveTutorial";
import { InteractiveTutorialRoot } from "./InteractiveTutorial/InteractiveTutorialRoot";
import { ITutorialEvents } from "./InteractiveTutorial/ITutorialEvents";

import { prestigeWorkerScripts } from "../NetscriptWorker";
import { dialogBoxCreate } from "./React/DialogBox";
import { GetAllServers } from "../Server/AllServers";
import { StockMarket } from "../StockMarket/StockMarket";

import type { ComplexPage } from "./Enums";
import type { IRouter, PageContext, PageWithContext } from "./Router";
import { isSimplePage, Page } from "./Router";
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
import { JobRoot } from "../Locations/ui/JobRoot";
import { LocationCity } from "../Locations/ui/City";
import { ProgramsRoot } from "../Programs/ui/ProgramsRoot";
import { ScriptEditorRoot } from "../ScriptEditor/ui/ScriptEditorRoot";
import { MilestonesRoot } from "../Milestones/ui/MilestonesRoot";
import { TerminalRoot } from "../Terminal/ui/TerminalRoot";
import { Terminal } from "../Terminal";
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
import { ActivateRecoveryMode, RecoveryMode, RecoveryRoot } from "./React/RecoveryRoot";
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
import { UIEventEmitter, UIEventType } from "./UIEventEmitter";
import { exceptionAlert } from "../utils/helpers/exceptionAlert";
import { SpecialServers } from "../Server/data/SpecialServers";
import { ErrorModal } from "../ErrorHandling/ErrorModal";
import { DocumentationPopUp } from "../Documentation/ui/DocumentationPopUp";

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

const MAX_PAGES_IN_HISTORY = 10;

type RouterAction = (
  | {
      type: "toPage";
      page: Page;
      context?: PageContext<ComplexPage>;
    }
  | {
      type: "back";
    }
) & { stackTrace: string | undefined };

/**
 * When the main UI is not loaded, all router actions ("toPage" and "back") are stored in this array. After that, we
 * will run them and show a warning popup. This queue is empty in a normal situation. If it has items, there are bugs
 * that try to route the main UI when it's not loaded.
 */
const pendingRouterActions: RouterAction[] = [];

export let Router: IRouter = {
  page: () => {
    return Page.LoadingScreen;
  },
  /**
   * This function is only called in ImportSave.tsx. That component is only used when the main UI shows Page.ImportSave,
   * so it's impossible for this function to run before the main UI is loaded. If it happens, it's a fatal error. In
   * that case, throwing an error is the only option.
   */
  allowRouting: () => {
    throw new Error("Router.allowRouting() was called before initialization.");
  },
  hidingMessages: () => true,
  toPage: (page: Page, context?: PageContext<ComplexPage>) => {
    const stackTrace = new Error().stack;
    console.error("Router.toPage() was called before initialization.", page, context, stackTrace);
    pendingRouterActions.push({
      type: "toPage",
      page,
      context,
      stackTrace,
    });
  },
  back: () => {
    const stackTrace = new Error().stack;
    console.error("Default Router.back() was called before initialization.", stackTrace);
    pendingRouterActions.push({
      type: "back",
      stackTrace,
    });
  },
};

function determineStartPage(): PageWithContext {
  if (RecoveryMode) {
    return { page: Page.Recovery };
  }
  /**
   * If the save data contains the server list, but WD data is invalid, isBitNodeFinished() will throw an error, and the
   * main UI will show a black screen instead of the recovery screen.
   */
  try {
    if (isBitNodeFinished()) {
      // Go to BitVerse UI without animation.
      return { page: Page.BitVerse, flume: false, quick: true };
    }
  } catch (error) {
    ActivateRecoveryMode(error);
    return { page: Page.Recovery };
  }
  if (Player.currentWork !== null) {
    return { page: Page.Work };
  }
  return { page: Page.Terminal };
}

export function GameRoot(): React.ReactElement {
  const { classes } = useStyles();

  const [pages, setPages] = useState<PageWithContext[]>(() => [determineStartPage()]);
  let pageWithContext = pages[0];

  /**
   * Theoretically, this case cannot happen because of the check in Router.back(). Nevertheless, we should still check
   * it. In the future, if we call "setPages" and remove items in the "pages" array without checking it properly,
   * this case can still happen.
   */
  if (pageWithContext === undefined) {
    /**
     * We have to delay showing the warning popup due to these reasons:
     * - React will complain: "Warning: Cannot update a component (`AlertManager`) while rendering a different
     * component (`GameRoot`)".
     * - There is a potential problem in AlertManager.tsx. Please check the comment there for more information.
     */
    setTimeout(() => {
      exceptionAlert(new Error(`pageWithContext is undefined`));
    }, 1000);
    pageWithContext = { page: Page.Terminal };
  }

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
    saveObject
      .saveGame()
      .then(() => {
        setTimeout(() => htmlLocation.reload(), 2000);
      })
      .catch((error) => {
        exceptionAlert(error);
      });
  }

  function attemptedForbiddenRouting(name: string) {
    console.error(`Routing is currently disabled - Attempted router.${name}()`);
  }

  const hiddenPages = new Set([
    Page.Recovery,
    Page.ImportSave,
    Page.BitVerse,
    Page.Infiltration,
    Page.BladeburnerCinematic,
  ]);

  Router = {
    page: () => pageWithContext.page,
    allowRouting: (value: boolean) => setAllowRoutingCalls(value),
    hidingMessages: () => hiddenPages.has(pageWithContext.page),
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
      if (!allowRoutingCalls) {
        return attemptedForbiddenRouting("back");
      }
      /**
       * If something calls Router.back() when the "pages" array has only 1 item, that array will be empty when the UI
       * is rerendered, and pageWithContext will be undefined. To avoid this problem, we return immediately in that case.
       */
      if (pages.length === 1) {
        return;
      }
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
  const hidePopups = Router.hidingMessages();
  let bypassGame = false;
  switch (pageWithContext.page) {
    case Page.Recovery: {
      mainPage = <RecoveryRoot softReset={softReset} />;
      withSidebar = false;
      bypassGame = true;
      break;
    }
    case Page.BitVerse: {
      mainPage = <BitverseRoot flume={pageWithContext.flume} quick={pageWithContext.quick} />;
      withSidebar = false;
      break;
    }
    case Page.Infiltration: {
      mainPage = <InfiltrationRoot location={pageWithContext.location} />;
      withSidebar = false;
      break;
    }
    case Page.BladeburnerCinematic: {
      mainPage = <BladeburnerCinematic />;
      withSidebar = false;
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
      mainPage = <ActiveScriptsRoot page={SimplePage.ActiveScripts} />;
      break;
    }
    case Page.RecentlyKilledScripts: {
      mainPage = <ActiveScriptsRoot page={SimplePage.RecentlyKilledScripts} />;
      break;
    }
    case Page.RecentErrors: {
      mainPage = <ActiveScriptsRoot page={SimplePage.RecentErrors} />;
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
      mainPage = <JobRoot />;
      break;
    case Page.Location: {
      mainPage = <GenericLocation location={pageWithContext.location} showBackButton={true} />;
      break;
    }
    case Page.Options: {
      mainPage = (
        <GameOptionsRoot
          save={() => {
            saveObject.saveGame().catch((error) => exceptionAlert(error));
          }}
          export={() => {
            saveObject.exportGame().catch((error) => exceptionAlert(error));
          }}
          forceKill={killAllScripts}
          softReset={softReset}
          reactivateTutorial={() => {
            prestigeWorkerScripts();
            Player.getHomeComputer().pushProgram(CompletedProgramName.nuke);
            Terminal.connectToServer(SpecialServers.Home);
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
            saveObject.exportGame().catch((error) => exceptionAlert(error));
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
      bypassGame = true;
      break;
    }
  }

  useEffect(() => {
    if (pendingRouterActions.length > 0) {
      // Run all pending actions and show a warning popup.
      for (const action of pendingRouterActions) {
        if (action.type === "toPage") {
          if (isSimplePage(action.page)) {
            Router.toPage(action.page);
          } else {
            Router.toPage(action.page, action.context ?? {});
          }
        } else {
          Router.back();
        }
      }
      exceptionAlert(
        new Error(
          `Router was used before the main UI is loaded. pendingRouterActions: ${JSON.stringify(
            pendingRouterActions,
          )}.`,
        ),
      );
      pendingRouterActions.length = 0;
    }
    // Emit an event to notify subscribers that the main UI is loaded.
    UIEventEmitter.emit(UIEventType.MainUILoaded);
  }, []);

  return (
    <MathJaxContext version={3} src={__webpack_public_path__ + "mathjax/tex-chtml.js"}>
      <ErrorBoundary key={errorBoundaryKey} softReset={softReset}>
        <BypassWrapper content={bypassGame ? mainPage : null}>
          <HistoryProvider>
            <SnackbarProvider>
              <Overview mode={ITutorial.isRunning ? "tutorial" : "overview"}>
                {(parentOpen) =>
                  !ITutorial.isRunning ? (
                    <CharacterOverview
                      parentOpen={parentOpen}
                      save={() => {
                        saveObject.saveGame().catch((error) => exceptionAlert(error));
                      }}
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
              <LogBoxManager hidden={hidePopups} />
              <AlertManager hidden={hidePopups} />
              <ErrorModal />
              <PromptManager hidden={hidePopups} />
              <FactionInvitationManager hidden={hidePopups} />
              <Snackbar hidden={hidePopups} />
              <DocumentationPopUp hidden={hidePopups} />
              <Apr1 />
            </SnackbarProvider>
          </HistoryProvider>
        </BypassWrapper>
      </ErrorBoundary>
      <V2Modal />
    </MathJaxContext>
  );
}
