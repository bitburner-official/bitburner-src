import React from "react";
import { Typography } from "@mui/material";
import { DarknetState } from "../models/DarknetState";
import { getSurroundingsVisualized } from "../models/labyrinth";
import { dnetStyles } from "./dnetStyles";
import { Result } from "@nsdefs";

export type LabyrinthSummaryProps = {
  result: Result | undefined;
  lastMovementFeedback: string | undefined;
  loadingText?: string;
};

export const LabyrinthSummary = ({
  result,
  lastMovementFeedback,
  loadingText,
}: LabyrinthSummaryProps): React.ReactElement => {
  const { classes } = dnetStyles({});

  // victory message
  if (result?.success) {
    return <Typography>{"You have successfully navigated the labyrinth! Congratulations."}</Typography>;
  }

  // movement message
  const [x, y] = DarknetState.labLocations[-1];
  const surroundings = getSurroundingsVisualized(DarknetState.labyrinth, x, y, 3, true, true)
    .split("")
    .map((c) => `${c}${c}${c}`)
    .join("")
    .replace("@@@", " @ ")
    .replace("XXX", " X ")
    .split("\n")
    .map((line) => `${line}\n${line.replace("@", " ").replace("X", " ")}`)
    .join("");

  return (
    <>
      <Typography>{loadingText?.includes("{") ? lastMovementFeedback ?? "" : "Travelling..."}</Typography>
      <Typography>Current Surroundings:</Typography>
      <pre className={classes.maze}>{surroundings}</pre>
      <Typography>
        Current Coordinates: {x},{y}
      </Typography>
    </>
  );
};
