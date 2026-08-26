import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Container, Card, SvgIcon, Typography, Tooltip } from "@mui/material";
import { getIcon } from "./ServerIcon";
import { getServerState } from "../models/DarknetState";
import { ServerSummary } from "./ServerSummary";
import { populateServerLogsWithNoise } from "../models/packetSniffing";
import { isLabyrinthServer } from "../effects/labyrinth";
import { PasswordPrompt } from "./PasswordPrompt";
import { copyToClipboard, formatObjectWithColoredKeys, formatToMaxDigits } from "./uiUtilities";
import { useCycleRerender } from "../../ui/React/hooks";
import type { DarknetServer } from "../../Server/DarknetServer";
import { logBoxBaseZIndex } from "../../ui/React/Constants";
import { Settings } from "../../Settings/Settings";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: DarknetServer;
  classes: {
    [key: string]: string;
  };
};

export const ServerDetailsModal = ({
  open,
  onClose,
  server,
  classes,
}: DWPasswordPromptModalProps): React.ReactElement => {
  useCycleRerender();

  const icon = getIcon(server.modelId);
  populateServerLogsWithNoise(server);
  const serverState = getServerState(server.hostname);
  const isLabServer = isLabyrinthServer(server.hostname);
  const recentLogs = serverState.serverLogs.slice(0, 5);
  const ramBlock = server.blockedRam;
  const blockedRamString = ramBlock ? formatToMaxDigits(ramBlock, 1) + "+" : "";
  const usedRamString = formatToMaxDigits(server.ramUsed - ramBlock, 1);
  const serverRamString = `RAM 占用：${blockedRamString}${usedRamString}/${server.maxRam} GB`;

  const logContent = recentLogs.map((log, index) => (
    <pre
      key={index}
      color="secondary"
      style={{ borderLeft: "1px solid grey", paddingLeft: "3px", whiteSpace: "pre-wrap" }}
    >
      {typeof log.message === "string"
        ? log.message
        : formatObjectWithColoredKeys(log.message, [
            "message",
            "data",
            "passwordAttempted",
            "passwordExpected",
            "code",
          ])}
    </pre>
  ));

  const copyHostname = () => copyToClipboard(server.hostname);

  return (
    <Modal open={open} onClose={onClose} removeFocus={false} sx={{ zIndex: logBoxBaseZIndex - 1 }}>
      <>
        <Container sx={{ width: "calc(min(900px, 80vw))", minHeight: "500px" }}>
          <div className={classes.inlineFlexBox}>
            <Typography variant="h5" color={server.hasAdminRights ? "primary" : "secondary"} onClick={copyHostname}>
              {server.hostname}
            </Typography>
            <Tooltip title={`服务器型号：${server.modelId}`}>
              <SvgIcon component={icon} color="secondary" />
            </Tooltip>
          </div>
          <br />
          {server.hasAdminRights ? (
            <>
              <Typography>密码："{server.password}"</Typography>
              <br />
              <Typography color="secondary">IP：{server.ip}</Typography>
              <Typography color="secondary">所需魅力：{server.requiredCharismaSkill}</Typography>
              <Tooltip
                title={`被服务器所有者封锁的 RAM：${ramBlock} GB。脚本占用的 RAM：${
                  server.ramUsed - ramBlock
                } GB。`}
              >
                <Typography color="secondary">{serverRamString}</Typography>
              </Tooltip>
              <Typography color="secondary">型号：{server.modelId}</Typography>
              <br />
              <div style={{ maxWidth: "300px" }}>
                <ServerSummary server={server} enableAuth={true} showDetails={true} classes={classes} />
              </div>
              <br />
              {isLabServer && (
                <>
                  <br />
                  <Typography>你已成功走出迷宫！恭喜！</Typography>
                </>
              )}
            </>
          ) : (
            <PasswordPrompt server={server} onClose={onClose} />
          )}
          {!isLabServer && (
            <>
              <Card style={{ height: "250px", overflowY: "scroll" }}>
                <div style={{ color: Settings.theme.maplocation, paddingLeft: "10px" }}>{logContent}</div>
              </Card>
            </>
          )}
        </Container>
      </>
    </Modal>
  );
};
