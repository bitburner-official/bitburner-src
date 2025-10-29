import React, { useState } from "react";
import { Typography, Select, MenuItem, Card } from "@mui/material";
import { DarknetState } from "../models/DarknetState";
import { getLabMaze, getLabyrinthDetails, getSurroundingsVisualized } from "../effects/labyrinth";
import { dnetStyles } from "./dnetStyles";
import type { DarknetResult } from "@nsdefs";
import { Player } from "@player";
import { useCycleRerender } from "../../ui/React/hooks";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { GetServer } from "../../Server/AllServers";

export type LabyrinthSummaryProps = {
  result: DarknetResult | undefined;
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
  const [x, y] =
    currentPerspective && DarknetState.labLocations[currentPerspective]
      ? DarknetState.labLocations[currentPerspective]
      : [1, 1];
  const surroundings = getSurroundingsVisualized(getLabMaze(), x, y, 3, true, true)
    .join("\n")
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
        .filter(([key, __]) => findRunningScriptByPid(Number(key)))
        .map(([key, __]) => {
          const script = findRunningScriptByPid(Number(key));
          const scriptServer = GetServer(script?.server ?? "");
          const connectedToLab = scriptServer?.serversOnNetwork.includes(lab.name);
          return (
            <MenuItem key={key} value={Number(key)} disabled={!connectedToLab}>
              {`PID ${key}: ${script?.server ?? ""} - ${!connectedToLab ? "(Not connected to lab)" : script?.filename}`}
            </MenuItem>
          );
        }),
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
        style={{ maxWidth: "250px" }}
      >
        {getMenuItems()}
      </Select>
    );
  };

  const response =
    DarknetState.serverState[lab.name]?.serverLogs
      .slice(-3)
      .map((log) => log.replaceAll('\\"', "'"))
      .join("\n") || "(no response yet)";

  return (
    <>
      {lab.cha > Player.skills.charisma ? (
        <Typography color="error">You dont yet have the wits needed to attempt the labyrinth.</Typography>
      ) : (
        <>
          <div className={classes.inlineFlexBox}>
            <div style={{ width: "50%" }}>
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
            </div>
            <div style={{ width: "50%" }}>
              <Card style={{ padding: "8px", minHeight: "60px", marginBottom: "8px" }}>
                <div style={{ color: "white" }}>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{response}</pre>
                </div>
              </Card>
            </div>
          </div>

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
