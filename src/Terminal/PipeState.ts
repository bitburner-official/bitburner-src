import { Link, Output, RawOutput } from "./OutputTypes";
import { Settings } from "../Settings/Settings";

export const PipeState = {
  outputToBeProcessed: [] as PipedOutput[],
  currentTerminalPipe: null as PipedCommand | null,
};

// TODO: Pushing output should extend the existing output that uses a specific pipe, if present

export function pushPipedOutput(output: Output | Link | RawOutput, pipeDestination: PipedCommand | null) {
  PipeState.outputToBeProcessed.push({
    output: output,
    pipeDestination: pipeDestination,
  });

  if (PipeState.outputToBeProcessed.length > Settings.MaxTerminalCapacity * 2) {
    PipeState.outputToBeProcessed.splice(0, PipeState.outputToBeProcessed.length - Settings.MaxTerminalCapacity * 2);
  }
}

export type PipedOutput = {
  output: Output | Link | RawOutput;
  pipeDestination: PipedCommand | null;
};

export type PipedCommand = {
  commandString: string;
  pipeType: string;
  nextPipe: PipedCommand | null;
};
