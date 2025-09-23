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
  const [currentPerspective, setCurrentPerspective] = useState<number | undefined>(-1);
  const { classes } = dnetStyles({});
  const lab = getLabyrinthDetails();
  useCycleRerender();

  // victory message
  if (result?.success) {
    return <Typography>{"You have successfully navigated the labyrinth! Congratulations."}</Typography>;
  }

  // handle perspective changes
  if (currentPerspective && !DarknetState.labLocations[currentPerspective]) {
    setCurrentPerspective(-1);
  }
  if (currentPerspective === -1 && !lab.manual) {
    const ids = Object.keys(DarknetState.labLocations)
      .map((k) => Number(k))
      .filter((k) => k !== -1);
    setCurrentPerspective(ids[0]);
  }

  // movement message
  const [x, y] = currentPerspective ? DarknetState.labLocations[currentPerspective] : [1, 1];
  const surroundings = getSurroundingsVisualized(getLabMaze(), x, y, 3, true, true)
    .split("")
    .map((c) => `${c}${c}${c}`)
    .join("")
    .replace("@@@", " @ ")
    .replace("XXX", " X ")
    .split("\n")
    .map((line) => `${line}\n${line.replace("@", " ").replace("X", " ")}`)
    .join("");

  const getMenuItems = () => {
    const scriptOptions = [
      ...Object.entries(DarknetState.labLocations)
        .filter(([key, __]) => key != "-1")
        .map(([key, __]) => (
          <MenuItem key={key} value={Number(key)}>
            {`PID ${key}`}
          </MenuItem>
        )),
    ];
    if (lab.manual) {
      return [
        <MenuItem key={-1} value={-1}>
          Manual UI
        </MenuItem>,
        ...scriptOptions,
      ];
    }
    return scriptOptions;
  };

  const getMenu = () => {
    if (Object.keys(DarknetState.labLocations).length === 1 && !lab.manual) {
      return <Typography>(No scripts found)</Typography>;
    }
    return (
      <Select
        id="select-pid"
        value={currentPerspective}
        label="Perspective to view"
        onChange={(val) => setCurrentPerspective(+val.target.value)}
      >
        {getMenuItems()}
      </Select>
    );
  };

  return (
    <>
      {lab.cha > Player.skills.charisma ? (
        <Typography color="error">You dont yet have the wits needed to attempt the labyrinth.</Typography>
      ) : (
        <>
          {currentPerspective === undefined ? (
            <>
              <Typography style={{ fontStyle: "italic" }}>
                This lab cannot be completed manually. Select a script PID that is attempting the labyrinth from the
                options below to view its progress.
              </Typography>
              <br />
              <br />
            </>
          ) : (
            <>
              <Typography>{loadingText?.includes("{") ? lastMovementFeedback ?? "" : "Travelling..."}</Typography>
              <Typography>Current Surroundings:</Typography>
              <pre className={classes.maze}>{surroundings}</pre>
              <Typography>
                Current Coordinates: {x},{y}
              </Typography>
            </>
          )}

          <br />
          <br />
          <div style={{ display: "inline-flex", alignItems: "left", gap: "8px" }}>
            <Typography>Script/perspective to follow: </Typography>
            {getMenu()}
          </div>
        </>
      )}
    </>
  );
};
