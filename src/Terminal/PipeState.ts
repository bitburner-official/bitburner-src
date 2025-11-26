import { Link, Output, RawOutput } from "./OutputTypes";
import { Settings } from "../Settings/Settings";
import { Terminal } from "../Terminal";
import { TerminalEvents } from "./TerminalEvents";

export const PipeState = {
  outputToBeProcessed: [] as PipedOutput[],
  currentTerminalPipe: null as PipedCommand | null,
  pidOfLastScriptRun: null as number | null,
};

export const PipeSymbols = {
  Pipe: "|",
  OutputRedirection: ">",
  AppendOutputRedirection: ">>",
  InputRedirection: "<",
};

export const PipeSymbolsList = [
  PipeSymbols.Pipe,
  PipeSymbols.OutputRedirection,
  PipeSymbols.AppendOutputRedirection,
  PipeSymbols.InputRedirection,
];

export function pushPipedOutput(output: Output | Link | RawOutput, pipeDestination: PipedCommand | null) {
  addOutputToBeProcessed(output, pipeDestination);

  if (PipeState.outputToBeProcessed.length > Settings.MaxTerminalCapacity) {
    PipeState.outputToBeProcessed.splice(0, PipeState.outputToBeProcessed.length - Settings.MaxTerminalCapacity);
  }
}

export function addOutputToBeProcessed(output: Output | Link | RawOutput, pipeDestination: PipedCommand | null) {
  const existingOutputRecord = PipeState.outputToBeProcessed.find((o) =>
    pipeDestinationIsIdentical(o.pipeDestination, pipeDestination),
  );
  if (existingOutputRecord) {
    // Append to existing output
    existingOutputRecord.output.push(output);
  } else {
    // Create a new output record
    PipeState.outputToBeProcessed.push({
      output: [output],
      pipeDestination: pipeDestination,
    });
  }
  TerminalEvents.emit();
}

export function getNextOutput(): PipedOutput | null {
  return PipeState.outputToBeProcessed[0] || null;
}

export function handlePipeError(error: string, currentPipe = PipeState.currentTerminalPipe) {
  if (currentPipe && !currentPipe?.hasShownError) {
    currentPipe.hasShownError = true;
    Terminal.error(`Error in pipe command: ${error}`);
  }
  clearPipe();
}

export function clearPipe() {
  PipeState.outputToBeProcessed.shift();
  PipeState.currentTerminalPipe = null;
}

function pipeDestinationIsIdentical(a: PipedCommand | null, b: PipedCommand | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return (
    a.commandString === b.commandString &&
    a.pipeSymbol === b.pipeSymbol &&
    pipeDestinationIsIdentical(a.nextPipe, b.nextPipe)
  );
}

export type PipedOutput = {
  output: (Output | Link | RawOutput)[];
  pipeDestination: PipedCommand | null;
};

export type PipedCommand = {
  commandString: string;
  pipeSymbol: string;
  nextPipe: PipedCommand | null;
  hasBeenEvaluated?: boolean;
  hasShownError?: boolean;
  stdInPort?: number;
};
