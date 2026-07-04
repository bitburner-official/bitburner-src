import React, { useState } from "react";
import { Typography, SvgIcon, Tooltip } from "@mui/material";
import { ServerDetailsModal } from "./ServerDetailsModal";
import { getIcon } from "./ServerIcon";
import { DarknetState } from "../models/DarknetState";
import { getPixelPosition } from "./networkCanvas";
import { ServerSummary } from "./ServerSummary";

import type { DarknetServer } from "../../Server/DarknetServer";
import { DWServerStyles, ServerName } from "./dnetStyles";
import { Settings } from "../../Settings/Settings";

export type DWServerProps = {
  server: DarknetServer;
  enableAuth: boolean;
  classes: {
    [key: string]: string;
  };
};

export function ServerStatusBox({ server, enableAuth, classes }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const icon = getIcon(server.modelId);

  const authButtonHandler = () => {
    DarknetState.openServer = server;
    setOpen(true);
  };

  const handleClose = () => {
    DarknetState.openServer = null;
    setOpen(false);
  };

  const getServerStyles = (server: DarknetServer) => {
    const position = getPixelPosition(server);
    const hasRunningScripts = !!server.runningScriptMap.size;
    return {
      ...DWServerStyles(),
      top: `${position.top}px`,
      left: `${position.left}px`,
      borderColor: !server.maxRam
        ? Settings.theme.info
        : server.hasStasisLink
        ? Settings.theme.money
        : hasRunningScripts
        ? Settings.theme.primary
        : Settings.theme.secondary,
    };
  };

  return (
    <>
      {open ? <ServerDetailsModal open={open} onClose={handleClose} server={server} classes={classes} /> : ""}
      <button
        style={{ ...getServerStyles(server), position: "absolute", userSelect: "none" }}
        className={classes.DWServer}
        onClick={authButtonHandler}
        disabled={!enableAuth}
      >
        <div style={{ padding: 0, margin: 0, width: "100%" }}>
          <div style={{ display: "inline-flex", flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
            <Tooltip title={`Server Model: ${server.modelId}`}>
              <SvgIcon component={icon} color="secondary" />
            </Tooltip>
            <Typography color={server.hasAdminRights ? "primary" : "secondary"} sx={ServerName}>
              {server.hostname}
            </Typography>
          </div>
          <Typography color="secondary" style={{ fontSize: "0.9em" }}>
            {server.ip} cha:{server.requiredCharismaSkill}
          </Typography>
          <br />
          <ServerSummary server={server} enableAuth={enableAuth} classes={classes} />
        </div>
      </button>
    </>
  );
}
