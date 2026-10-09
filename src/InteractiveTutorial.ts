import { Player } from "@player";
import { LiteratureName } from "@enums";
import { ITutorialEvents } from "./ui/InteractiveTutorial/ITutorialEvents";

// Ordered array of keys to Interactive Tutorial Steps
enum iTutorialSteps {
  Start, // Intro, overview, and housekeeping

  // Hacking
  TerminalScan,
  TerminalScanAnalyze,
  TerminalScanAnalyze2,
  TerminalConnect,
  TerminalAnalyze,
  TerminalNuke,
  TerminalManualHack,
  TerminalHackWeakenGrowMechanics,
  TerminalHome,
  TerminalNano,
  ScriptEditorEditAndSave,
  ScriptEditorRam,
  ScriptEditorGoToTerminalPage,
  TerminalFree,
  TerminalRun,
  TerminalGoToActiveScriptsPage, // Also explains a bit about running scripts
  ActiveScriptsDescription,
  TerminalTail,
  TerminalTailOutcome,
  TerminalLs,
  TerminalScp,
  TerminalHelp,

  // Finishing off
  TerminalGoToCharacterStatsPage,
  CharacterStatsDescription,
  CharacterStatsGoToWorldPage,
  WorldDescription,
  DocumentationInfo,

  End, // Empty step not seen by players. Powers the logic in iTutorialNextStep.
}

const ITutorial = {
  currStep: iTutorialSteps.Start,
  isRunning: false,

  // Keeps track of whether each step has been done
  stepIsDone: {
    [iTutorialSteps.Start]: false,
    [iTutorialSteps.TerminalScan]: false,
    [iTutorialSteps.TerminalScanAnalyze]: false,
    [iTutorialSteps.TerminalScanAnalyze2]: false,
    [iTutorialSteps.TerminalConnect]: false,
    [iTutorialSteps.TerminalAnalyze]: false,
    [iTutorialSteps.TerminalNuke]: false,
    [iTutorialSteps.TerminalManualHack]: false,
    [iTutorialSteps.TerminalHackWeakenGrowMechanics]: false,
    [iTutorialSteps.TerminalHome]: false,
    [iTutorialSteps.TerminalNano]: false,
    [iTutorialSteps.ScriptEditorEditAndSave]: false,
    [iTutorialSteps.ScriptEditorRam]: false,
    [iTutorialSteps.ScriptEditorGoToTerminalPage]: false,
    [iTutorialSteps.TerminalFree]: false,
    [iTutorialSteps.TerminalRun]: false,
    [iTutorialSteps.TerminalGoToActiveScriptsPage]: false,
    [iTutorialSteps.ActiveScriptsDescription]: false,
    [iTutorialSteps.TerminalTail]: false,
    [iTutorialSteps.TerminalTailOutcome]: false,
    [iTutorialSteps.TerminalLs]: false,
    [iTutorialSteps.TerminalScp]: false,
    [iTutorialSteps.TerminalHelp]: false,
    [iTutorialSteps.TerminalGoToCharacterStatsPage]: false,
    [iTutorialSteps.CharacterStatsDescription]: false,
    [iTutorialSteps.CharacterStatsGoToWorldPage]: false,
    [iTutorialSteps.WorldDescription]: false,
    [iTutorialSteps.DocumentationInfo]: false,
    [iTutorialSteps.End]: false,
  },
};

function iTutorialStart(): void {
  ITutorial.isRunning = true;
  ITutorial.currStep = iTutorialSteps.Start;
}

// Go to the next step and evaluate it
function iTutorialNextStep(): void {
  ITutorial.stepIsDone[ITutorial.currStep] = true;
  if (ITutorial.currStep < iTutorialSteps.End) {
    ITutorial.currStep += 1;
  }
  if (ITutorial.currStep === iTutorialSteps.End) iTutorialEnd();
  ITutorialEvents.emit();
}

// Go to previous step and evaluate
function iTutorialPrevStep(): void {
  if (ITutorial.currStep > iTutorialSteps.Start) {
    ITutorial.currStep -= 1;
  }
  ITutorialEvents.emit();
}

function iTutorialEnd(): void {
  ITutorial.isRunning = false;
  ITutorial.currStep = iTutorialSteps.Start;
  const messages = Player.getHomeComputer().messages;
  const handbook = LiteratureName.HackersStartingHandbook;
  if (!messages.includes(handbook)) messages.push(handbook);
  ITutorialEvents.emit();
}

export { iTutorialSteps, iTutorialEnd, iTutorialStart, iTutorialNextStep, ITutorial, iTutorialPrevStep };
