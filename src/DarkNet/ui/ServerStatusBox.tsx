import React, { useState, memo } from "react";
import { ServerDetailsModal } from "./ServerDetailsModal";
import { getIcon } from "./ServerIcon";
import { DarknetState } from "../models/DarknetState";
import { getPixelPosition } from "./networkCanvas";
import { ServerSummary } from "./ServerSummary";

import type { DarknetServer } from "../../Server/DarknetServer";
import { DWServerStyles, ServerName } from "./dnetStyles";

export type DWServerProps = {
  server: DarknetServer;
  enableAuth: boolean;
  classes: {
    [key: string]: string;
  };
  stateSnapshot: string;
};

function ServerStatusBoxImpl({ server, enableAuth, classes }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const Icon = getIcon(server.modelId);

  const authButtonHandler = () => {
    DarknetState.openServer = server;
    setOpen(true);
  };

  const handleClose = () => {
    DarknetState.openServer = null;
    setOpen(false);
  };

  const position = getPixelPosition(server);
  const buttonStyle = {
    ...DWServerStyles,
    top: `${position.top}px`,
    left: `${position.left}px`,
    borderColor: server.hasStasisLink ? "gold" : server.hasAdminRights ? "green" : "grey",
    position: "absolute" as const,
    userSelect: "none" as const,
  };
  const hostnameClass = server.hasAdminRights ? classes.txtPrimary : classes.txtSecondary;

  return (
    <>
      {open ? <ServerDetailsModal open={open} onClose={handleClose} server={server} classes={classes} /> : null}
      <button style={buttonStyle} className={classes.DWServer} onClick={authButtonHandler} disabled={!enableAuth}>
        <div style={{ padding: 0, margin: 0, width: "100%" }}>
          <div style={{ display: "inline-flex", flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
            <span title={`Server Model: ${server.modelId}`} style={{ display: "inline-flex" }}>
              <Icon className={classes.txtSecondary} />
            </span>
            <span className={hostnameClass} style={ServerName}>
              {server.hostname}
            </span>
          </div>
          <span className={classes.txtSecondary} style={{ display: "block", fontSize: "0.9em" }}>
            {server.ip} cha:{server.requiredCharismaSkill}
          </span>
          <br />
          <ServerSummary server={server} enableAuth={enableAuth} classes={classes} />
        </div>
      </button>
    </>
  );
}

export const ServerStatusBox = memo(ServerStatusBoxImpl);

/**
 * Snapshot the mutable server fields that ServerStatusBox/ServerSummary render.
 * This is used to avoid re-rendering the status box unless visible values change.
 */
export function getServerStateSnapshot(server: DarknetServer): string {
  return [
    server.hasAdminRights,
    server.hasStasisLink,
    server.backdoorInstalled,
    server.depth,
    server.leftOffset,
    server.blockedRam,
    server.requiredCharismaSkill,
    server.caches.length,
    server.contracts.length,
    server.messages.length,
    server.programs.length,
    server.textFiles.size,
    server.runningScriptMap.size,
  ].join("|");
}
