import React, { useState } from "react";
import { Typography, Select, MenuItem, Card, Tooltip } from "@mui/material";
import { DarknetState, LogEntry } from "../models/DarknetState";
import { getLabMaze, getLabyrinthDetails, getSurroundingsVisualized } from "../effects/labyrinth";
import { dnetStyles } from "./dnetStyles";
import type { DarknetResult } from "@nsdefs";
import { Player } from "@player";
import { useCycleRerender } from "../../ui/React/hooks";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { GetServerOrThrow } from "../../Server/AllServers";

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

  // movement message
  const [x, y] =
    currentPerspective && DarknetState.labLocations[currentPerspective]
      ? DarknetState.labLocations[currentPerspective]
      : [1, 1];
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
    const darknetScripts = Object.keys(DarknetState.labLocations).map((pid) => findRunningScriptByPid(Number(pid)));

    const scriptOptions = [];
    for (const script of darknetScripts) {
      if (!script) continue;
      const scriptServer = GetServerOrThrow(script.server);
      const connectedToLab = scriptServer.serversOnNetwork.includes(lab.name);
      scriptOptions.push(
        <MenuItem key={script.pid} value={Number(script.pid)} disabled={!connectedToLab}>
          {`PID ${script.pid}: ${script.server} - ${!connectedToLab ? "(Not connected to lab)" : script.filename}`}
        </MenuItem>,
      );
    }

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
    let perspective = currentPerspective ?? -1;
    if (perspective && perspective !== -1 && !DarknetState.labLocations[perspective]) {
      perspective = -1;
    }
    if (perspective === -1 && !lab.manual) {
      const ids = Object.keys(DarknetState.labLocations)
        .map((k) => Number(k))
        .filter((k) => k !== -1);
      perspective = ids[0];
    }

    return (
      <Select
        id="select-pid"
        value={perspective}
        label="Perspective to view"
        onChange={(val) => setCurrentPerspective(+val.target.value)}
        style={{ maxWidth: "250px" }}
      >
        {getMenuItems()}
      </Select>
    );
  };

  const getLogs = () =>
    DarknetState.serverState[lab.name]?.serverLogs
      .filter((log) => log.pid === currentPerspective)
      .slice(0, 2)
      .map(stringifyLog)
      .join("\n") || "(no response yet)";

  const stringifyLog = (log: LogEntry) => {
    if (typeof log.message === "string") return log.message;
    const json = JSON.stringify(log.message, null, 2);
    const surroundings = (log.message.data ?? "").replaceAll("\n", "\n           ");
    return json.replace(/("data": )("[^"]*")/g, `$1"${surroundings}"`);
  };

  const getManualFeedback = () => {
    if (currentPerspective !== -1) return " ";
    if (loadingText?.includes("{") || loadingText?.includes("(")) {
      return lastMovementFeedback ?? "";
    }
    return "Travelling...";
  };

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
                  <Typography>{getManualFeedback()}</Typography>
                  <Typography>Current Surroundings:</Typography>
                  <pre className={classes.maze}>{surroundings}</pre>
                  <Typography>
                    Current Coordinates: {x},{y}
                  </Typography>
                </>
              )}
            </div>
            <div style={{ width: "50%" }}>
              <Typography variant="caption" color="secondary">
                Logs scraped via <pre style={{ display: "inline" }}>heartbleed</pre>:
              </Typography>
              <Card style={{ padding: "8px", minHeight: "270px", marginBottom: "8px" }}>
                <div style={{ color: "white" }}>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{getLogs()}</pre>
                </div>
              </Card>
              <Tooltip
                title={
                  <>
                    dnet.location.details() gives the current script's location in the labyrinth, as well as which
                    directions are valid movements.
                    <br />
                    <br />
                    Example output:
                    <pre>&#123; "coords": [1,2], "north": false, "east": true, "south": false, "west:" true &#125;</pre>
                  </>
                }
              >
                <Typography variant="caption" color="secondary">
                  For more info on your current location in the labyrinth:
                  <pre>await ns.dnet.location.details()</pre>
                </Typography>
              </Tooltip>
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
