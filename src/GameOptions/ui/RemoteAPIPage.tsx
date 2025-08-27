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
  const [remoteFileApiReconnectionDelay, setRemoteFileApiReconnectionDelay] = useState(
    Settings.RemoteFileApiReconnectionDelay.toString(),
  );
  const [reconnectionDelayError, setReconnectionDelayError] = useState("");

  const isValidHostname = hostnameError === "";
  const isValidPort = portError === "";
  const isValidReconnectionDelay = reconnectionDelayError === "";

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
    const port = Number(newValue);
    const result = isValidConnectionPort(port);
    if (!result.success) {
      setPortError(result.message);
      return;
    }
    Settings.RemoteFileApiPort = port;
    setPortError("");
  }

  function handleRemoteFileApiReconnectionDelayChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRemoteFileApiReconnectionDelay(newValue);
    const reconnectionDelay = Number(newValue);
    if (!Number.isFinite(reconnectionDelay) || reconnectionDelay < 0) {
      setReconnectionDelayError("Invalid reconnection delay");
      return;
    }
    Settings.RemoteFileApiReconnectionDelay = reconnectionDelay;
    setReconnectionDelayError("");
  }

  return (
    <GameOptionsPage title="Remote API">
      <Typography>
        These settings control the Remote API for Bitburner. This is typically used to write scripts using an external
        text editor and then upload files to the home server.
      </Typography>
      <Typography>
        <Link
          href="https://github.com/bitburner-official/bitburner-src/blob/stable/src/Documentation/doc/en/programming/remote_api.md"
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
              startAdornment: <Typography style={{ minWidth: "200px" }}>Hostname:&nbsp;</Typography>,
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
              startAdornment: (
                <Typography color={isValidPort ? "success" : "error"} style={{ minWidth: "200px" }}>
                  Port:&nbsp;
                </Typography>
              ),
            }}
            value={remoteFileApiPort}
            onChange={handleRemoteFileApiPortChange}
            placeholder="12525"
            size={"medium"}
          />
          {portError && <Typography color={Settings.theme.error}>{portError}</Typography>}
        </div>
      </Tooltip>
      <Tooltip
        title={
          <Typography>
            When the connection is closed, Bitburner will automatically reconnect after this delay.
            <br />
            The value must be in seconds. Set it to 0 to disable the feature.
          </Typography>
        }
      >
        <div>
          <TextField
            error={!isValidReconnectionDelay}
            InputProps={{
              startAdornment: (
                <Typography color={isValidReconnectionDelay ? "success" : "error"} style={{ minWidth: "200px" }}>
                  Reconnection delay:&nbsp;
                </Typography>
              ),
            }}
            value={remoteFileApiReconnectionDelay}
            onChange={handleRemoteFileApiReconnectionDelayChange}
            placeholder="0"
            size={"medium"}
          />
          {reconnectionDelayError && <Typography color={Settings.theme.error}>{reconnectionDelayError}</Typography>}
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
