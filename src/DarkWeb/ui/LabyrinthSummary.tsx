import React from "react";
import { Typography } from "@mui/material";
import { PasswordResponse, ResponseStatus } from "../models/DnetServerData";
import { DarknetState } from "../models/DarknetState";
import { getSurroundingsVisualized } from "../models/labyrinth";
import { dnetStyles } from "./dnetStyles";

export type LabyrinthSummaryProps = {
  response: PasswordResponse | null;
  loadingText?: string;
};

export const LabyrinthSummary = ({ response, loadingText }: LabyrinthSummaryProps): React.ReactElement => {
  const { classes } = dnetStyles({});

  // victory message
  if (!response || response?.status == ResponseStatus.SUCCESS) {
    return <Typography>{response?.msg}</Typography>;
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
      <Typography>{loadingText?.includes("{") ? response.msg : "Travelling..."}</Typography>
      <Typography>Current Surroundings:</Typography>
      <pre className={classes.maze}>{surroundings}</pre>
      <Typography>
        Current Coordinates: {x},{y}
      </Typography>
    </>
  );
};
