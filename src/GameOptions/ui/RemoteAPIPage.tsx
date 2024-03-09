import React, { useState } from "react";
import { Button, Link, TextField, Tooltip, Typography } from "@mui/material";
import { GameOptionsPage } from "./GameOptionsPage";
import { Settings } from "../../Settings/Settings";
import { ConnectionBauble } from "./ConnectionBauble";
import { isRemoteFileApiConnectionLive, newRemoteFileApiConnection } from "../../RemoteFileAPI/RemoteFileAPI";

export const RemoteAPIPage = (): React.ReactElement => {
  const [remoteFileApiPort, setRemoteFileApiPort] = useState(Settings.RemoteFileApiPort);
  const [remoteFileApiAddress, setRemoteFileApiAddress] = useState(Settings.RemoteFileApiAddress);

  function handleRemoteFileApiPortChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setRemoteFileApiPort(Number(event.target.value));
    Settings.RemoteFileApiPort = Number(event.target.value);
  }

  function handleRemoteFileApiAddressChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setRemoteFileApiAddress(String(event.target.value));
    Settings.RemoteFileApiAddress = String(event.target.value);
  }

  return (
    <GameOptionsPage title="Remote API">
      <Typography>
        These settings control the Remote API for bitburner. This is typically used to write scripts using an external
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
            This address is used to connect to a Remote API, please ensure that it matches with your Remote API address.
            Default localhost.
          </Typography>
        }
      >
        <TextField
          key={"remoteAPIAddress"}
          InputProps={{
            startAdornment: <Typography>Address:&nbsp;</Typography>,
          }}
          value={remoteFileApiAddress}
          onChange={handleRemoteFileApiAddressChange}
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
          key={"remoteAPIPort"}
          InputProps={{
            startAdornment: (
              <Typography color={remoteFileApiPort > 0 && remoteFileApiPort <= 65535 ? "success" : "error"}>
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
