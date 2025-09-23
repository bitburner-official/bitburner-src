import React, { useState } from "react";
import { Typography, Select, MenuItem } from "@mui/material";
import { DarknetState } from "../models/DarknetState";
import { getLabMaze, getLabyrinthDetails, getSurroundingsVisualized } from "../effects/labyrinth";
import { dnetStyles } from "./dnetStyles";
import { Result } from "@nsdefs";
import { Player } from "@player";
import { useCycleRerender } from "../../ui/React/hooks";

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
  const [currentPerspective, setCurrentPerspective] = useState<number>(-1);
  const { classes } = dnetStyles({});
  const lab = getLabyrinthDetails();
  useCycleRerender();

  // victory message
  if (result?.success) {
    return <Typography>{"You have successfully navigated the labyrinth! Congratulations."}</Typography>;
  }

  if (!DarknetState.labLocations[currentPerspective]) {
    setCurrentPerspective(-1);
  }

  // movement message
  const [x, y] = DarknetState.labLocations[currentPerspective];
  const surroundings = getSurroundingsVisualized(getLabMaze(), x, y, 3, true, true)
    .split("")
    .map((c) => `${c}${c}${c}`)
    .join("")
    .replace("@@@", " @ ")
    .replace("XXX", " X ")
    .split("\n")
    .map((line) => `${line}\n${line.replace("@", " ").replace("X", " ")}`)
    .join("");

  const getMenuItems = () => [
    <MenuItem key={-1} value={-1}>
      Manual UI
    </MenuItem>,
    ...Object.entries(DarknetState.labLocations)
      .filter(([key, __]) => key != "-1")
      .map(([key, __]) => (
        <MenuItem key={key} value={Number(key)}>
          {`PID ${key}`}
        </MenuItem>
      )),
  ];

  return (
    <>
      {lab.cha > Player.skills.charisma ? (
        <Typography color="error">You dont yet have the wits needed to attempt the labyrinth.</Typography>
      ) : (
        <>
          <Typography>{loadingText?.includes("{") ? lastMovementFeedback ?? "" : "Travelling..."}</Typography>
          <Typography>Current Surroundings:</Typography>
          <pre className={classes.maze}>{surroundings}</pre>
          <Typography>
            Current Coordinates: {x},{y}
          </Typography>
          <br />
          <br />
          <div style={{ display: "inline-flex", alignItems: "left", gap: "8px" }}>
            <Typography>Script/perspective to follow: </Typography>
            <Select
              id="select-pid"
              value={currentPerspective}
              label="Perspective to view"
              onChange={(val) => setCurrentPerspective(+val.target.value)}
            >
              {getMenuItems()}
            </Select>
          </div>
        </>
      )}
    </>
  );
};
