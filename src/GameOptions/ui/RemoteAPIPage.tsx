import React, { useEffect, useState } from "react";
import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { GameOptionsPage } from "./GameOptionsPage";
import { Settings } from "../../Settings/Settings";
import { isValidConnectionHostname, isValidRemoteFileApiConnectionPortSetting } from "../../Settings/SettingsUtils";
import { RemoteFileApiConnectionStatus } from "./RemoteFileApiConnectionStatus";
import {
  canCreateNewRFAConnection,
  closeRFAConnection,
  isRFAConnectionLive,
  newRFAConnection,
} from "../../RemoteFileAPI/RemoteFileAPI";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { DocumentationLink } from "../../ui/React/DocumentationLink";
import { RFAConnectionEvents, RFAConnectionSettingEvents } from "../../RemoteFileAPI/Remote";
import { useRerender } from "../../ui/React/hooks";

export const RemoteAPIPage = (): React.ReactElement => {
  const [remoteFileApiHostname, setRemoteFileApiHostname] = useState(Settings.RemoteFileApiAddress);
  const [hostnameError, setHostnameError] = useState(
    isValidConnectionHostname(Settings.RemoteFileApiAddress).message ?? "",
  );
  const [remoteFileApiPort, setRemoteFileApiPort] = useState(Settings.RemoteFileApiPort.toString());
  const [portError, setPortError] = useState(
    isValidRemoteFileApiConnectionPortSetting(Settings.RemoteFileApiPort).message ?? "",
  );
  const [remoteFileApiReconnectionDelay, setRemoteFileApiReconnectionDelay] = useState(
    Settings.RemoteFileApiReconnectionDelay.toString(),
  );
  const [reconnectionDelayError, setReconnectionDelayError] = useState("");

  const rerender = useRerender();

  useEffect(
    () =>
      RFAConnectionEvents.subscribe(() => {
        rerender();
      }),
    [rerender],
  );

  const isValidHostname = hostnameError === "";
  const isValidPort = portError === "";
  const isValidReconnectionDelay = reconnectionDelayError === "";

  function handleRFAHostnameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRFAHostname(newValue);
    const result = isValidRFAHostname(newValue);
    if (!result.success) {
      setHostnameError(result.message);
      return;
    }
    Settings.RFAAddress = newValue;
    RFAConnectionSettingEvents.emit();
    setHostnameError("");
  }

  function handleRFAPortChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRFAPort(newValue);
    const port = Number(newValue);
    const result = isValidRemoteFileApiConnectionPortSetting(port);
    if (!result.success) {
      setPortError(result.message);
      return;
    }
    Settings.RFAPort = port;
    RFAConnectionSettingEvents.emit();
    setPortError("");
  }

  function handleRFAReconnectionDelayChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.trim();
    setRFAReconnectionDelay(newValue);
    const reconnectionDelay = Number(newValue);
    if (!Number.isFinite(reconnectionDelay) || reconnectionDelay < 0) {
      setReconnectionDelayError("Invalid reconnection delay");
      return;
    }
    Settings.RFAReconnectionDelay = reconnectionDelay;
    RFAConnectionSettingEvents.emit();
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
      <RFAConnectionStatus showIcon={false} />
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
            value={rfaHostname}
            onChange={handleRFAHostnameChange}
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
            value={rfaPort}
            onChange={handleRFAPortChange}
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
            value={rfaReconnectionDelay}
            onChange={handleRFAReconnectionDelayChange}
            placeholder="0"
            size={"medium"}
          />
          {reconnectionDelayError && <Typography color={Settings.theme.error}>{reconnectionDelayError}</Typography>}
        </div>
      </Tooltip>
      <OptionSwitch
        checked={Settings.UseWssForRFA}
        onChange={(newValue) => {
          Settings.UseWssForRFA = newValue;
          RFAConnectionSettingEvents.emit();
        }}
        text="Use wss"
        tooltip={<>Use wss instead of ws when connecting to RemoteFileApi clients.</>}
      />
      <Button
        disabled={!isRFAConnectionLive() && !canCreateNewRFAConnection()}
        onClick={() => {
          if (!isRFAConnectionLive()) {
            newRFAConnection();
          } else {
            closeRFAConnection();
          }
        }}
      >
        {!isRFAConnectionLive() ? "Connect" : "Disconnect"}
      </Button>
    </GameOptionsPage>
  );
};
