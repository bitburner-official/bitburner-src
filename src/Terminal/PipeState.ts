import { Link, Output, RawOutput } from "./OutputTypes";
import { Settings } from "../Settings/Settings";
import { Terminal } from "../Terminal";

export const PipeState = {
  outputToBeProcessed: [] as PipedOutput[],
  currentTerminalPipe: null as PipedCommand | null,
};

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
}

export function getNextOutput(): PipedOutput | null {
  return PipeState.outputToBeProcessed[0] || null;
}

export function handlePipeError(error: string) {
  clearPipe();
  Terminal.error(`Error in pipe command: ${error}`);
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
    a.pipeType === b.pipeType &&
    pipeDestinationIsIdentical(a.nextPipe, b.nextPipe)
  );
}

export type PipedOutput = {
  output: (Output | Link | RawOutput)[];
  pipeDestination: PipedCommand | null;
};

export type PipedCommand = {
  commandString: string;
  pipeType: string;
  nextPipe: PipedCommand | null;
  hasBeenEvaluated?: boolean;
};
