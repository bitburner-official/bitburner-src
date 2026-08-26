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
      setReconnectionDelayError("无效的重连延迟");
      return;
    }
    Settings.RemoteFileApiReconnectionDelay = reconnectionDelay;
    RemoteFileApiConnectionSettingEvents.emit();
    setReconnectionDelayError("");
  }

  return (
    <GameOptionsPage title="Remote API">
      <Typography>
        这些设置用于控制 Bitburner 的 Remote API。它通常用于在外部文本编辑器中编写脚本，然后将文件上传到家用电脑。
      </Typography>
      <Typography>
        <DocumentationLink page="programming/remote_api.md">文档</DocumentationLink>
      </Typography>
      <RemoteFileApiConnectionStatus showIcon={false} />
      <Tooltip
        title={
          <Typography>
            此主机名用于连接 Remote API，请确保它与你的 Remote API 主机名一致。
            <br />
            若使用 IPv6，需要用方括号包裹，例如：[::1]
            <br />
            默认值：localhost。
          </Typography>
        }
      >
        <div>
          <TextField
            error={!isValidHostname}
            InputProps={{
              startAdornment: <Typography style={{ minWidth: "200px" }}>主机名：&nbsp;</Typography>,
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
            此端口号用于连接 Remote API。请确保它与你的 Remote API 服务器端口一致。
            <br />
            取值范围必须为 [0, 65535]。设为 0 可禁用此功能。
          </Typography>
        }
      >
        <div>
          <TextField
            error={!isValidPort}
            InputProps={{
              startAdornment: (
                <Typography color={isValidPort ? "success" : "error"} style={{ minWidth: "200px" }}>
                  端口：&nbsp;
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
            如果连接尝试失败或当前连接意外断开，Bitburner 将在此延迟后自动重新连接。
            <br />
            注意：如果你主动断开连接，Bitburner 将不会自动重连。
            <br />
            取值单位为秒。设为 0 可禁用此功能。
          </Typography>
        }
      >
        <div>
          <TextField
            error={!isValidReconnectionDelay}
            InputProps={{
              startAdornment: (
                <Typography color={isValidReconnectionDelay ? "success" : "error"} style={{ minWidth: "200px" }}>
                  重连延迟：&nbsp;
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
        text="使用 wss"
        tooltip={<>连接 RFA 客户端时使用 wss 而非 ws。</>}
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
        {!isRemoteFileApiConnectionLive() ? "连接" : "断开连接"}
      </Button>
    </GameOptionsPage>
  );
};
