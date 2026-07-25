import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import {
  getRemoteFileApiConnectionStatus,
  isRemoteFileApiConnectionLive,
  newRemoteFileApiConnection,
} from "../../RemoteFileAPI/RemoteFileAPI";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { RemoteFileApiConnectionEvents } from "../../RemoteFileAPI/Remote";
import { isValidConnectionHostname, isValidConnectionPort } from "src/Settings/SettingsUtils";

export const RemoteFileApiConnectionStatus = ({ showIcon }: { showIcon: boolean }): React.ReactElement => {
  const [rfaConnectionStatus, setRfaConnectionStatus] = useState(getRemoteFileApiConnectionStatus());

  useEffect(
    () =>
      RemoteFileApiConnectionEvents.subscribe((status) => {
        setRfaConnectionStatus(status);
      }),
    [],
  );

  let color;
  switch (rfaConnectionStatus) {
    case "Online":
      color = Settings.theme.success;
      break;
    case "Offline":
      color = Settings.theme.error;
      break;
    case "Reconnecting":
      color = Settings.theme.warning;
      break;
  }

  return (
    <Box style={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
      {showIcon ? (
        <IconButton
          aria-label="Remote API status"
          onClick={() => {
            if (
              !isRemoteFileApiConnectionLive() &&
              isValidConnectionHostname(Settings.RemoteFileApiAddress) &&
              isValidConnectionPort(Settings.RemoteFileApiPort)
            ) {
              newRemoteFileApiConnection();
            }
            Router.toPage(Page.Options, { tab: "Remote API" });
          }}
        >
          <Tooltip title={`Remote API: ${rfaConnectionStatus}`}>
            <OnlinePredictionIcon style={{ fontSize: "30px", color }} />
          </Tooltip>
        </IconButton>
      ) : (
        <Typography>
          Status: <span style={{ color }}>{rfaConnectionStatus}</span>
        </Typography>
      )}
    </Box>
  );
};
