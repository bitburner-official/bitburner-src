import React, { useState } from "react";
import { Button, Link, TextField, Tooltip, Typography } from "@mui/material";
import { GameOptionsPage } from "./GameOptionsPage";
import { isValidConnectionHostname, isValidConnectionPort, Settings } from "../../Settings/Settings";
import { ConnectionBauble } from "./ConnectionBauble";
import { isRemoteFileApiConnectionLive, newRemoteFileApiConnection } from "../../RemoteFileAPI/RemoteFileAPI";

export const RemoteAPIPage = (): React.ReactElement => {
  const [remoteFileApiHostname, setRemoteFileApiHostname] = useState(Settings.RemoteFileApiAddress);
  const [remoteFileApiPort, setRemoteFileApiPort] = useState(Settings.RemoteFileApiPort);

  function handleRemoteFileApiHostnameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    let newValue = event.target.value.trim();
    // Empty string will be automatically changed to "localhost".
    if (newValue === "") {
      newValue = "localhost";
    }
    if (!isValidConnectionHostname(newValue)) {
      return;
    }
    setRemoteFileApiHostname(newValue);
    Settings.RemoteFileApiAddress = newValue;
  }

  function handleRemoteFileApiPortChange(event: React.ChangeEvent<HTMLInputElement>): void {
    let newValue = event.target.value.trim();
    // Empty string will be automatically changed to "0".
    if (newValue === "") {
      newValue = "0";
    }
    const port = Number.parseInt(newValue);
    // Disallow invalid ports but still allow the player to set port to 0. Setting it to 0 means that RFA is disabled.
    if (port !== 0 && !isValidConnectionPort(port)) {
      return;
    }
    setRemoteFileApiPort(port);
    Settings.RemoteFileApiPort = port;
  }

  return (
    <GameOptionsPage title="Remote API">
      <Typography>
        These settings control the Remote API for Bitburner. This is typically used to write scripts using an external
        text editor and then upload files to the home server.
      </Typography>
      <Typography>
        <Link
          href="https://github.com/bitburner-official/bitburner-src/blob/dev/src/Documentation/doc/programming/remote_api.md"
          target="_blank"
        >
          Documentation
        </Link>
      </Typography>
      <ConnectionBauble isConnected={isRemoteFileApiConnectionLive} />
      <Tooltip
        title={
          <Typography>
            This hostname is used to connect to a Remote API, please ensure that it matches with your Remote API
            hostname. Default: localhost.
          </Typography>
        }
      >
        <TextField
          InputProps={{
            startAdornment: <Typography>Hostname:&nbsp;</Typography>,
          }}
          value={remoteFileApiHostname}
          onChange={handleRemoteFileApiHostnameChange}
          placeholder="localhost"
          size={"medium"}
        />
      </Tooltip>
      <br />
      <Tooltip
        title={
          <Typography>
            This port number is used to connect to a Remote API, please ensure that it matches with your Remote API
            server port. Set to 0 to disable the feature.
          </Typography>
        }
      >
        <TextField
          InputProps={{
            startAdornment: (
              <Typography color={isValidConnectionPort(remoteFileApiPort) ? "success" : "error"}>
                Port:&nbsp;
              </Typography>
            ),
          }}
          value={remoteFileApiPort}
          onChange={handleRemoteFileApiPortChange}
          placeholder="12525"
          size={"medium"}
        />
      </Tooltip>
      <br />
      <Button onClick={newRemoteFileApiConnection}>Connect</Button>
    </GameOptionsPage>
  );
};
