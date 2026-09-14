import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import {
  canCreateNewRFAConnection,
  closeRFAConnection,
  getRFAConnectionStatus,
  newRFAConnection,
} from "../../RemoteFileAPI/RemoteFileAPI";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Settings } from "../../Settings/Settings";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { RFAConnectionEvents, RFAConnectionSettingEvents } from "../../RemoteFileAPI/Remote";
import { useRerender } from "../../ui/React/hooks";

export const RemoteFileApiConnectionStatus = ({ showIcon }: { showIcon: boolean }): React.ReactElement => {
  const [remoteFileApiConnectionStatus, setRemoteFileApiConnectionStatus] = useState(
    getRemoteFileApiConnectionStatus(),
  );
  const rerender = useRerender();

  useEffect(() => {
    const unsubscriberForRemoteFileApiEvents = RemoteFileApiConnectionEvents.subscribe((status) => {
      setRemoteFileApiConnectionStatus(status);
    });
    const unsubscriberForRemoteFileApiSettingEvents = RemoteFileApiConnectionSettingEvents.subscribe(() => {
      rerender();
    });
    return () => {
      unsubscriberForRemoteFileApiEvents();
      unsubscriberForRemoteFileApiSettingEvents();
    };
  }, [rerender]);

  const connectionConfig = {
    Online: { color: Settings.theme.success, instruction: "Click to disconnect" },
    Offline: {
      color: Settings.theme.error,
      instruction: canCreateNewRFAConnection() ? "Click to connect" : "Click to go to the option page",
    },
    Reconnecting: {
      color: Settings.theme.warning,
      instruction: canCreateNewRFAConnection()
        ? "Click to try to connect immediately without waiting"
        : "Click to go to the option page",
    },
    Connecting: {
      color: Settings.theme.warning,
      instruction: "Connecting",
    },
  };

  const color = connectionConfig[remoteFileApiConnectionStatus].color;

  return (
    <Box style={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
      {showIcon ? (
        <IconButton
          aria-label="Remote API status"
          onClick={() => {
            switch (remoteFileApiConnectionStatus) {
              case "Online":
                closeRFAConnection();
                break;
              case "Offline":
              case "Reconnecting":
                if (canCreateNewRFAConnection()) {
                  newRFAConnection();
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
                Remote API: {remoteFileApiConnectionStatus}
                <br />
                {connectionConfig[remoteFileApiConnectionStatus].instruction}
              </>
            }
          >
            <OnlinePredictionIcon style={{ fontSize: "30px", color }} />
          </Tooltip>
        </IconButton>
      ) : (
        <Typography>
          Status: <span style={{ color }}>{remoteFileApiConnectionStatus}</span>
        </Typography>
      )}
    </Box>
  );
};
