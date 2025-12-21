import { Link, Output, RawOutput } from "./OutputTypes";
import { Settings } from "../Settings/Settings";
import { TerminalEvents } from "./TerminalEvents";
import { PortHandle } from "../NetscriptPort";

const PipeState = {
  currentRedirects: [] as RedirectedCommand[],
  outputToBeProcessed: [] as RedirectedOutput[], // TODO: remove
  currentTerminalPipe: null as RedirectedCommand | null,
  nextStdinPort: 1e7,
};

export const PipeSymbols = {
  Pipe: "|",
  OutputRedirection: ">",
  AppendOutputRedirection: ">>",
  InputRedirection: "<",
} as const;

export function isPipeSymbol(symbol: string | number | boolean): boolean {
  return Object.keys(PipeSymbols).some((key) => PipeSymbols[key as keyof typeof PipeSymbols] === symbol);
}

export function pushRedirectedOutput(output: Output | Link | RawOutput, redirectDestination: RedirectedCommand | null) {
  addOutputToBeProcessed(output, redirectDestination);

  if (PipeState.outputToBeProcessed.length > Settings.MaxTerminalCapacity) {
    PipeState.outputToBeProcessed.splice(0, PipeState.outputToBeProcessed.length - Settings.MaxTerminalCapacity);
  }
}

export function addOutputToBeProcessed(
  output: Output | Link | RawOutput,
  redirectDestination: RedirectedCommand | null,
) {
  const existingOutputRecord = PipeState.outputToBeProcessed.find((o) =>
    redirectDestinationIsIdentical(o.redirectDestination, redirectDestination),
  );
  if (existingOutputRecord) {
    // Append to existing output
    existingOutputRecord.output.push(output);
  } else {
    // Create a new output record
    PipeState.outputToBeProcessed.push({
      output: [output],
      redirectDestination: redirectDestination,
    });
  }
  TerminalEvents.emit();
}

export function getNextOutput(): RedirectedOutput | null {
  return PipeState.outputToBeProcessed[0] || null;
}

export function handlePipeError(error: string, currentPipe = PipeState.currentTerminalPipe) {
  if (currentPipe && !currentPipe?.hasShownError) {
    currentPipe.hasShownError = true;
  }
  clearPipe();
}

export function clearPipe() {
  PipeState.currentTerminalPipe = null;
}

function redirectDestinationIsIdentical(a: RedirectedCommand | null, b: RedirectedCommand | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return (
    a.commandString === b.commandString &&
    a.pipeSymbol === b.pipeSymbol &&
    redirectDestinationIsIdentical(a.nextPipe, b.nextPipe)
  );
}

export type RedirectedOutput = {
  output: (Output | Link | RawOutput)[];
  redirectDestination: RedirectedCommand | null;
};

export type RedirectedCommand = {
  commandString: string;
  pipeSymbol: string;
  nextPipe: RedirectedCommand | null;
  stdin: PortHandle;
  hasBeenEvaluated?: boolean;
  hasShownError?: boolean;
  stdInPort?: number;
};
