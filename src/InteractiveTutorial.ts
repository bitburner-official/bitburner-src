import { Player } from "@player";
import { LiteratureName } from "@enums";
import { ITutorialEvents } from "./ui/InteractiveTutorial/ITutorialEvents";

// Ordered array of keys to Interactive Tutorial Steps
enum iTutorialSteps {
  Start,

  // Hacking
  TerminalScan, // Using 'scan' Terminal command
  TerminalScanAnalyze1, // Using 'scan-analyze' Terminal command
  TerminalScanAnalyze2, // Using 'scan-analyze 3' Terminal command
  TerminalConnect, // Connecting to n00dles
  TerminalAnalyze, // Analyzing n00dles
  TerminalNuke, // NUKE n00dles
  TerminalManualHack, // Hack n00dles
  TerminalHackingMechanics, // Explanation of hacking mechanics
  TerminalGoHome, // Go home before creating a script.
  TerminalCreateScript, // Create a script using 'nano'
  ScriptEditorEdit, // Script Editor page - Edit script
  ScriptEditorRam, // Script Editor page - Check RAM usage
  ScriptEditorGoToTerminal,
  TerminalFree, // Using 'Free' Terminal command
  TerminalRunScript, // Running script using 'run' Terminal command
  TerminalGoToActiveScriptsPage,
  ActiveScriptsPage,
  ActiveScriptsToTerminal,
  TerminalTailScript,
  TerminalLs, // Using 'ls' Terminal command
  TerminalScp, // using the 'scp' Terminal command
  TerminalHelp, // Using 'help' Terminal command

  // Finishing off
  GoToCharacterPage, // Click on 'Stats' page
  CharacterPage, // Introduction to 'Stats' page
  GoToWorldPage,
  WorldDescription,
  DocumentationPageInfo,
  End,
}

const ITutorial = {
  currStep: iTutorialSteps.Start,
  isRunning: false,

  // Keeps track of whether each step has been done
  stepIsDone: {
    [iTutorialSteps.Start]: false,

    [iTutorialSteps.TerminalScan]: false,
    [iTutorialSteps.TerminalScanAnalyze1]: false,
    [iTutorialSteps.TerminalScanAnalyze2]: false,
    [iTutorialSteps.TerminalConnect]: false,
    [iTutorialSteps.TerminalAnalyze]: false,
    [iTutorialSteps.TerminalNuke]: false,
    [iTutorialSteps.TerminalManualHack]: false,
    [iTutorialSteps.TerminalHackingMechanics]: false,
    [iTutorialSteps.TerminalGoHome]: false,
    [iTutorialSteps.TerminalCreateScript]: false,
    [iTutorialSteps.ScriptEditorEdit]: false,
    [iTutorialSteps.ScriptEditorRam]: false,
    [iTutorialSteps.ScriptEditorGoToTerminal]: false,
    [iTutorialSteps.TerminalFree]: false,
    [iTutorialSteps.TerminalRunScript]: false,
    [iTutorialSteps.TerminalGoToActiveScriptsPage]: false,
    [iTutorialSteps.ActiveScriptsPage]: false,
    [iTutorialSteps.ActiveScriptsToTerminal]: false,
    [iTutorialSteps.TerminalTailScript]: false,
    [iTutorialSteps.TerminalLs]: false,
    [iTutorialSteps.TerminalScp]: false,
    [iTutorialSteps.TerminalHelp]: false,
    [iTutorialSteps.GoToCharacterPage]: false,
    [iTutorialSteps.CharacterPage]: false,
    [iTutorialSteps.GoToWorldPage]: false,
    [iTutorialSteps.WorldDescription]: false,
    [iTutorialSteps.DocumentationPageInfo]: false,
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
