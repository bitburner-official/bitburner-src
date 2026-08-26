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
    Online: { color: Settings.theme.success, instruction: "点击断开连接" },
    Offline: {
      color: Settings.theme.error,
      instruction: canCreateNewRemoteFileApiConnection() ? "点击连接" : "点击前往选项页面",
    },
    Reconnecting: {
      color: Settings.theme.warning,
      instruction: canCreateNewRemoteFileApiConnection()
        ? "点击立即尝试连接，无需等待"
        : "点击前往选项页面",
    },
    Connecting: {
      color: Settings.theme.warning,
      instruction: "连接中",
    },
  };

  const color = connectionConfig[rfaConnectionStatus].color;

  return (
    <Box style={{ display: "flex", flex: 1, justifyContent: "flex-start", alignItems: "center" }}>
      {showIcon ? (
        <IconButton
          aria-label="Remote API 状态"
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
                Remote API：{rfaConnectionStatus}
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
          状态：<span style={{ color }}>{rfaConnectionStatus}</span>
        </Typography>
      )}
    </Box>
  );
};
