import React, { useEffect, useState } from "react";
import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { GameOptionsPage } from "./GameOptionsPage";
import { Settings } from "../../Settings/Settings";
import { isValidConnectionHostname, isValidRFAConnectionPortSetting } from "../../Settings/SettingsUtils";
import { RemoteFileApiConnectionStatus } from "./RemoteFileApiConnectionStatus";
import {
  canCreateNewRemoteFileApiConnection,
  closeRemoteFileApiConnection,
  isRemoteFileApiConnectionLive,
  newRemoteFileApiConnection,
} from "../../RemoteFileAPI/RemoteFileAPI";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { DocumentationLink } from "../../ui/React/DocumentationLink";
import { RemoteFileApiConnectionEvents, RemoteFileApiConnectionSettingEvents } from "../../RemoteFileAPI/Remote";
import { useRerender } from "../../ui/React/hooks";

export const RemoteAPIPage = (): React.ReactElement => {
  const [remoteFileApiHostname, setRemoteFileApiHostname] = useState(Settings.RemoteFileApiAddress);
  const [hostnameError, setHostnameError] = useState(
    isValidConnectionHostname(Settings.RemoteFileApiAddress).message ?? "",
  );
  const [remoteFileApiPort, setRemoteFileApiPort] = useState(Settings.RemoteFileApiPort.toString());
  const [portError, setPortError] = useState(isValidRFAConnectionPortSetting(Settings.RemoteFileApiPort).message ?? "");
  const [remoteFileApiReconnectionDelay, setRemoteFileApiReconnectionDelay] = useState(
    Settings.RemoteFileApiReconnectionDelay.toString(),
  );
  const [reconnectionDelayError, setReconnectionDelayError] = useState("");

  const rerender = useRerender();

  useEffect(
    () =>
      RemoteFileApiConnectionEvents.subscribe(() => {
        rerender();
      }),
    [rerender],
  );

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
    RemoteFileApiConnectionSettingEvents.emit();
    setHostnameError("");
  }

  function handleRemoteFileApiPortChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRemoteFileApiPort(newValue);
    const port = Number(newValue);
    const result = isValidRFAConnectionPortSetting(port);
    if (!result.success) {
      setPortError(result.message);
      return;
    }
    Settings.RemoteFileApiPort = port;
    RemoteFileApiConnectionSettingEvents.emit();
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
    RemoteFileApiConnectionSettingEvents.emit();
    setReconnectionDelayError("");
  }

  return (
    <GameOptionsPage title="Remote API">
      <Typography>
        These settings control the Remote API for Bitburner. This is typically used to write scripts using an external
        text editor and then upload files to the home server.
      </Typography>
      <Typography>
        <DocumentationLink page="programming/remote_api.md">Documentation</DocumentationLink>
      </Typography>
      <RemoteFileApiConnectionStatus showIcon={false} />
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
            If a connection attempt fails or the current connection is closed unexpectedly, Bitburner will automatically
            reconnect after this delay.
            <br />
            Note that Bitburner will NOT automatically reconnect if you intentionally disconnect.
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
        onChange={(newValue) => {
          Settings.UseWssForRemoteFileApi = newValue;
          RemoteFileApiConnectionSettingEvents.emit();
        }}
        text="Use wss"
        tooltip={<>Use wss instead of ws when connecting to RFA clients.</>}
      />
      <Button
        disabled={!isRemoteFileApiConnectionLive() && !canCreateNewRemoteFileApiConnection()}
        onClick={() => {
          if (!isRemoteFileApiConnectionLive()) {
            newRemoteFileApiConnection();
          } else {
            closeRemoteFileApiConnection();
          }
        }}
      >
        {!isRemoteFileApiConnectionLive() ? "Connect" : "Disconnect"}
      </Button>
    </GameOptionsPage>
  );
};
