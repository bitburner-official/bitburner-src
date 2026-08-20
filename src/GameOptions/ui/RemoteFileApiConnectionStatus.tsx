import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import {
  canCreateNewRemoteFileApiConnection,
  closeRemoteFileApiConnection,
  getRemoteFileApiConnectionStatus,
  newRemoteFileApiConnection,
} from "../../RemoteFileAPI/RemoteFileAPI";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { RemoteFileApiConnectionEvents, RemoteFileApiConnectionSettingEvents } from "../../RemoteFileAPI/Remote";
import { useRerender } from "../../ui/React/hooks";

export const RemoteFileApiConnectionStatus = ({ showIcon }: { showIcon: boolean }): React.ReactElement => {
  const [rfaConnectionStatus, setRfaConnectionStatus] = useState(getRemoteFileApiConnectionStatus());
  const rerender = useRerender();

  useEffect(() => {
    const unsubscriberForRFAEvents = RemoteFileApiConnectionEvents.subscribe((status) => {
      setRfaConnectionStatus(status);
    });
    const unsubscriberForRFASettingEvents = RemoteFileApiConnectionSettingEvents.subscribe(() => {
      rerender();
    });
    return () => {
      unsubscriberForRFAEvents();
      unsubscriberForRFASettingEvents();
    };
  }, [rerender]);

  const connectionConfig = {
    Online: { color: Settings.theme.success, instruction: "Click to disconnect" },
    Offline: {
      color: Settings.theme.error,
      instruction: canCreateNewRemoteFileApiConnection() ? "Click to connect" : "Click to go to the option page",
    },
    Reconnecting: {
      color: Settings.theme.warning,
      instruction: canCreateNewRemoteFileApiConnection()
        ? "Click to try to connect immediately without waiting"
        : "Click to go to the option page",
    },
    Connecting: {
      color: Settings.theme.warning,
      instruction: "Connecting",
    },
  };

  const color = connectionConfig[rfaConnectionStatus].color;

  return (
    <Box style={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
      {showIcon ? (
        <IconButton
          aria-label="Remote API status"
          onClick={() => {
            switch (rfaConnectionStatus) {
              case "Online":
                closeRemoteFileApiConnection();
                break;
              case "Offline":
              case "Reconnecting":
                if (canCreateNewRemoteFileApiConnection()) {
                  newRemoteFileApiConnection();
                } else {
                  Router.toPage(Page.Options, { tab: "Remote API" });
                }
                break;
              case "Connecting":
                // Do nothing.
                break;
            }
          }}
        >
          <Tooltip
            title={
              <>
                Remote API: {rfaConnectionStatus}
                <br />
                {connectionConfig[rfaConnectionStatus].instruction}
              </>
            }
          >
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
