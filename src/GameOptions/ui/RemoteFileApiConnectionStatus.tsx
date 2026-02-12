import React, { useState, useEffect } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { getRemoteFileApiConnectionStatus } from "../../RemoteFileAPI/RemoteFileAPI";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Settings } from "../../Settings/Settings";

export const RemoteFileApiConnectionStatus = ({ showIcon }: { showIcon: boolean }): React.ReactElement => {
  const [rfaConnectionStatus, setRfaConnectionStatus] = useState(getRemoteFileApiConnectionStatus());
  getRemoteFileApiConnectionStatus;

  useEffect(() => {
    const timer = setInterval(() => {
      setRfaConnectionStatus(getRemoteFileApiConnectionStatus());
    }, 500);
    return () => clearInterval(timer);
  }, []);

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
        <Tooltip title={`Remote API: ${rfaConnectionStatus}`}>
          <OnlinePredictionIcon style={{ fontSize: "30px", color }} />
        </Tooltip>
      ) : (
        <Typography>
          Status: <span style={{ color }}>{rfaConnectionStatus}</span>
        </Typography>
      )}
    </Box>
  );
};
