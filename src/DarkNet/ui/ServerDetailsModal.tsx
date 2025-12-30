import React, { useRef } from "react";
import { Modal } from "../../ui/React/Modal";
import { Container, Card, SvgIcon, Typography, Tooltip } from "@mui/material";
import { getIcon } from "./ServerIcon";
import { getServerState } from "../models/DarknetState";
import { ServerSummary } from "./ServerSummary";
import { populateServerLogsWithNoise } from "../models/packetSniffing";
import { isLabyrinthServer } from "../effects/labyrinth";
import { PasswordPrompt } from "./PasswordPrompt";
import { copyToClipboard, formatToMaxDigits } from "./uiUtilities";
import { useCycleRerender } from "../../ui/React/hooks";
import { sleep } from "../../utils/Utility";
import type { DarknetServer } from "../../Server/DarknetServer";

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
  const focusTarget = useRef<HTMLInputElement>(null);

  const icon = getIcon(server.icon);
  populateServerLogsWithNoise(server);
  const serverState = getServerState(server.hostname);
  const isLabServer = isLabyrinthServer(server.hostname);
  const recentLogs = serverState.serverLogs.slice(0, 5);
  const ramBlock = server.blockedRam;
  const blockedRamString = ramBlock ? formatToMaxDigits(ramBlock, 1) + "+" : "";
  const usedRamString = formatToMaxDigits(server.ramUsed - ramBlock, 1);
  const serverRamString = `ram in use: ${blockedRamString}${usedRamString}/${server.maxRam} GB`;

  const logContent = recentLogs.map((log, index) => (
    <pre
      key={index}
      color="secondary"
      style={{ borderLeft: "1px solid grey", paddingLeft: "3px", whiteSpace: "pre-wrap" }}
    >
      {typeof log.message === "string" ? log.message : JSON.stringify(log.message, null, 2)}
    </pre>
  ));

  const onSuccess = async () => {
    await sleep(50);
    focusTarget.current?.focus();
  };
  const copyHostname = () => copyToClipboard(server.hostname);

  return (
    <Modal open={open} onClose={onClose} removeFocus={false}>
      <>
        <input ref={focusTarget} className={classes.hiddenInput}></input>
        <Container sx={{ width: "calc(min(900px, 90vw))", minHeight: "500px" }}>
          <div className={classes.inlineFlexBox}>
            <Typography variant="h5" color={server.hasAdminRights ? "primary" : "secondary"} onClick={copyHostname}>
              {server.hostname}
            </Typography>
            <SvgIcon component={icon} color="secondary" />
          </div>
          <br />
          {server.hasAdminRights ? (
            <>
              <Typography>Password: "{server.password}"</Typography>
              <br />
              <Typography color="secondary">
                {server.ip} cha:{server.requiredCharismaSkill}
              </Typography>
              <Tooltip
                title={`Ram blocked by server owner: ${ramBlock} GB. Ram in use by scripts: ${
                  server.ramUsed - ramBlock
                } GB.`}
              >
                <Typography color="secondary">{serverRamString}</Typography>
              </Tooltip>
              <Typography color="secondary">model:{server.modelId}</Typography>
              <br />
              <div style={{ maxWidth: "300px" }}>
                <ServerSummary server={server} enableAuth={true} showDetails={true} classes={classes} />
              </div>{" "}
              <br />
              <br />
              {isLabServer && (
                <>
                  <br />
                  <Typography>You have successfully navigated the labyrinth! Congratulations!</Typography>
                </>
              )}
            </>
          ) : (
            <PasswordPrompt
              server={server}
              onClose={onClose}
              onSuccess={() => {
                onSuccess().catch((error) => console.error(error));
              }}
            />
          )}
          {!isLabServer && (
            <>
              <Card style={{ height: "250px", overflowY: "scroll" }}>
                <div style={{ color: "white", paddingLeft: "10px" }}>{logContent}</div>
              </Card>
            </>
          )}
        </Container>
      </>
    </Modal>
  );
};
