import React, { useState } from "react";
import { Typography, Select, MenuItem, Card } from "@mui/material";
import { cleanUpLabyrinthLocations, DarknetState, getServerState, LogEntry } from "../models/DarknetState";
import {
  getLabMaze,
  getLabyrinthDetails,
  getLabyrinthLocationReport,
  getSurroundingsVisualized,
} from "../effects/labyrinth";
import { dnetStyles } from "./dnetStyles";
import { Player } from "@player";
import { useCycleRerender } from "../../ui/React/hooks";
import { findRunningScriptByPid } from "../../Script/ScriptHelpers";
import { GetServerOrThrow } from "../../Server/AllServers";
import { assertPasswordResponse, isPasswordResponse } from "../models/DarknetServerOptions";
import { Settings } from "../../Settings/Settings";

export type LabyrinthSummaryProps = {
  isAuthenticating: boolean;
};

export const LabyrinthSummary = ({ isAuthenticating }: LabyrinthSummaryProps): React.ReactElement => {
  const [currentPerspective, setCurrentPerspective] = useState<number>(-1);
  const { classes } = dnetStyles({});
  useCycleRerender();

  const lab = getLabyrinthDetails();
  if (lab.cha > Player.skills.charisma) {
    return <Typography color="error">You don't yet have the wits needed to attempt the labyrinth.</Typography>;
  }

  cleanUpLabyrinthLocations();
  const [x, y] = DarknetState.labLocations[currentPerspective] ? DarknetState.labLocations[currentPerspective] : [1, 1];
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
      if (!script) {
        continue;
      }
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
    // With non-manual labyrinth, return immediately if there are no pids navigating the labyrinth.
    if (Object.keys(DarknetState.labLocations).length === 1 && !lab.manual) {
      return <Typography>(No scripts found)</Typography>;
    }
    let perspective = currentPerspective;
    // This happens when a script navigating the labyrinth dies.
    if (perspective !== -1 && !DarknetState.labLocations[perspective]) {
      perspective = -1;
    }
    // With non-manual labyrinth, if there are pids navigating the labyrinth and the perspective is not one of them, set
    // the perspective to one of those pids.
    if (perspective === -1 && !lab.manual) {
      const ids = Object.keys(DarknetState.labLocations).filter((k) => Number(k) !== -1);
      perspective = Number(ids[0]);
    }
    // Set the React state if necessary.
    if (perspective !== currentPerspective) {
      setCurrentPerspective(perspective);
    }

    return (
      <Select
        value={perspective}
        label="Perspective to view"
        onChange={(val) => {
          setCurrentPerspective(Number(val.target.value));
        }}
        style={{ maxWidth: "250px" }}
      >
        {getMenuItems()}
      </Select>
    );
  };

  const getLogs = () =>
    getServerState(lab.name)
      .serverLogs.filter((log) => log.pid === currentPerspective)
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
    if (isAuthenticating) {
      return "Travelling...";
    }
    if (currentPerspective !== -1) {
      return `You are following the progress of pid ${currentPerspective} instead of the manual mode.`;
    }
    const lastLog = getServerState(lab.name).serverLogs.find(
      (log) => log.pid === -1 && isPasswordResponse(log.message),
    );
    if (lastLog == null) {
      return "";
    }
    assertPasswordResponse(lastLog.message);
    return lastLog.message.message;
  };

  const getLocationStatusString = () => {
    const dataString = JSON.stringify(getLabyrinthLocationReport(currentPerspective));
    // Add a zero width space before the success flag so the text can wrap for better readability
    return dataString.replace(`,"success"`, `,\u200B"success"`);
  };

  return (
    <>
      <div className={classes.inlineFlexBox}>
        <div style={{ width: "50%" }}>
          {!lab.manual && currentPerspective === -1 ? (
            <Typography style={{ fontStyle: "italic", paddingRight: "10px" }}>
              This lab cannot be completed manually. Select a script PID that is attempting the labyrinth from the
              options below to view its progress.
            </Typography>
          ) : (
            <>
              <Typography>
                Manual mode feedback: <br />
                {getManualFeedback()}
              </Typography>
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
            <div style={{ color: Settings.theme.maplocation }}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{getLogs()}</pre>
            </div>
          </Card>

          <Typography variant="caption" color="secondary">
            ns.dnet.labreport:
          </Typography>
          <Card style={{ padding: "8px" }}>
            <div style={{ color: Settings.theme.maplocation }}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "10.5px" }}>{getLocationStatusString()}</pre>
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
  );
};
