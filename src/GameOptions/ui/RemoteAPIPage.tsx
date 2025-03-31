import React, { useState } from "react";
import { Button, Link, TextField, Tooltip, Typography } from "@mui/material";
import { GameOptionsPage } from "./GameOptionsPage";
import { isValidConnectionHostname, isValidConnectionPort, Settings } from "../../Settings/Settings";
import { ConnectionBauble } from "./ConnectionBauble";
import { isRemoteFileApiConnectionLive, newRemoteFileApiConnection } from "../../RemoteFileAPI/RemoteFileAPI";
import { OptionSwitch } from "../../ui/React/OptionSwitch";

export const RemoteAPIPage = (): React.ReactElement => {
  const [remoteFileApiHostname, setRemoteFileApiHostname] = useState(Settings.RemoteFileApiAddress);
  const [hostnameError, setHostnameError] = useState(
    isValidConnectionHostname(Settings.RemoteFileApiAddress).message ?? "",
  );
  const [remoteFileApiPort, setRemoteFileApiPort] = useState(Settings.RemoteFileApiPort.toString());
  const [portError, setPortError] = useState(isValidConnectionPort(Settings.RemoteFileApiPort).message ?? "");

  const isValidHostname = hostnameError === "";
  const isValidPort = portError === "";

  function handleRemoteFileApiHostnameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRemoteFileApiHostname(newValue);
    const result = isValidConnectionHostname(newValue);
    if (!result.success) {
      setHostnameError(result.message);
      return;
    }
    Settings.RemoteFileApiAddress = newValue;
    setHostnameError("");
  }

  function handleRemoteFileApiPortChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRemoteFileApiPort(newValue);
    const port = Number.parseInt(newValue);
    const result = isValidConnectionPort(port);
    if (!result.success) {
      setPortError(result.message);
      return;
    }
    Settings.RemoteFileApiPort = port;
    setPortError("");
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
            hostname.
            <br />
            If you use IPv6, you need to wrap it in square brackets. For example: [::1]
            <br />
            Default: localhost.
          </Typography>
        }
      >
        <div>
          <TextField
            error={!isValidHostname}
            InputProps={{
              startAdornment: <Typography>Hostname:&nbsp;</Typography>,
            }}
            value={remoteFileApiHostname}
            onChange={handleRemoteFileApiHostnameChange}
            placeholder="localhost"
            size={"medium"}
          />
          {hostnameError && <Typography color={Settings.theme.error}>{hostnameError}</Typography>}
        </div>
      </Tooltip>
      <Tooltip
        title={
          <Typography>
            This port number is used to connect to the Remote API. Please ensure that it matches with your Remote API
            server port.
            <br />
            The value must be in the range of [0, 65535]. Set it to 0 to disable the feature.
          </Typography>
        }
      >
        <div>
          <TextField
            error={!isValidPort}
            InputProps={{
              startAdornment: <Typography color={isValidPort ? "success" : "error"}>Port:&nbsp;</Typography>,
            }}
            value={remoteFileApiPort}
            onChange={handleRemoteFileApiPortChange}
            placeholder="12525"
            size={"medium"}
          />
          {portError && <Typography color={Settings.theme.error}>{portError}</Typography>}
        </div>
      </Tooltip>
      <OptionSwitch
        checked={Settings.UseWssForRemoteFileApi}
        onChange={(newValue) => (Settings.UseWssForRemoteFileApi = newValue)}
        text="Use wss"
        tooltip={<>Use wss instead of ws when connecting to RFA clients.</>}
      />
      <Button disabled={!isValidHostname || !isValidPort} onClick={newRemoteFileApiConnection}>
        Connect
      </Button>
    </GameOptionsPage>
  );
};
