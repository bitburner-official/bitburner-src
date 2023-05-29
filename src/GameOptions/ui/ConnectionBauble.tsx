import React, { useEffect, useState } from "react";

import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { Typography } from "@mui/material";

interface baubleProps {
  isConnected: () => boolean;
}

export const ConnectionBauble = (props: baubleProps): React.ReactElement => {
  const [connection, setConnection] = useState(props.isConnected());

  useEffect(() => {
    const timer = setInterval(() => {
      setConnection(props.isConnected());
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <>
      <Typography>
        Status:&nbsp;
        <Typography component="span" color={connection ? "primary" : "error"}>
          {connection ? (
            <>
              Online&nbsp;
              <WifiIcon />
            </>
          ) : (
            <>
              Offline&nbsp;
              <WifiOffIcon />
            </>
          )}
        </Typography>
      </Typography>
    </>
  );
};
