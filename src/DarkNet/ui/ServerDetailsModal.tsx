import React, { useEffect } from "react";
import { Modal } from "../../ui/React/Modal";
import { Container, Card, SvgIcon, Typography, Tooltip } from "@mui/material";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { DarknetEvents, getServerState } from "../models/DarknetState";
import { BaseServer } from "../../Server/BaseServer";
import { ServerSummary } from "./ServerSummary";
import { dnetStyles } from "./dnetStyles";
import { populateServerLogsWithNoise } from "../models/packetSniffing";
import { getLabyrinthDetails, isLabyrinthServer } from "../models/labyrinth";
import { PasswordPrompt } from "./PasswordPrompt";
import { copyToClipboard, decolorJsonProperties, formatToMaxDigits } from "./uiUtilities";
import { useRerender } from "../../ui/React/hooks";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: BaseServer;
};

export const ServerDetailsModal = ({ open, onClose, server }: DWPasswordPromptModalProps): React.ReactElement => {
  const rerender = useRerender();
  const icon = getIcon(server.darknetData?.icon ?? Icon.Terminal);
  const { classes } = dnetStyles({});

  useEffect(() => {
    DarknetEvents.subscribe(() => rerender());
  }, [rerender]);

  populateServerLogsWithNoise(server);
  const serverState = getServerState(server.hostname);
  const isLabServer = isLabyrinthServer(server.hostname);
  const canEnterLabManually = getLabyrinthDetails().manual;
  const recentLogs = serverState.serverLogs?.slice(0, 5) ?? [];
  const ramBlock = server.darknetData?.ramBlock ?? 0;
  const blockedRamString = ramBlock ? formatToMaxDigits(ramBlock, 1) + "+" : "";
  const usedRamString = formatToMaxDigits(server.ramUsed - ramBlock, 1);
  const serverRamString = `ram in use: ${blockedRamString}${usedRamString}/${server.maxRam} GB`

  const logContent = recentLogs.map((log, index) => (
    <pre
      key={index}
      color="secondary"
      style={{ borderLeft: "1px solid grey", paddingLeft: "3px", whiteSpace: "normal" }}
    >
      {decolorJsonProperties(log)}
    </pre>
  ));

  const copyHostname = () => copyToClipboard(server.hostname);

  return (
    <Modal open={open} onClose={onClose} removeFocus={false}>
      <>
        <Container sx={{ width: "calc(min(700px, 80vw))", minHeight: "500px" }}>
          <div className={classes.inlineFlexBox}>
            <Typography variant="h5" color={server.hasAdminRights ? "primary" : "secondary"} onClick={copyHostname}>
              {server.hostname}
            </Typography>
            <SvgIcon component={icon} color="secondary" />
          </div>
          <br />
          {server.hasAdminRights ? (
            <>
              <Typography>Password: "{server.darknetData?.password ?? ""}"</Typography>
              <br />
              {isLabServer ? (
                <>
                  <br />
                  <Typography>You have successfully navigated the labyrinth! Congratulations!</Typography>
                </>
              ) : (
                ""
              )}
              <Typography color="secondary">
                {server.ip} cha:{server.requiredHackingSkill}
              </Typography>
              <Tooltip title={`Ram blocked by server owner: ${ramBlock} GB. Ram in use by scripts: ${server.ramUsed - ramBlock} GB.`}>
                <Typography color="secondary">
                  {serverRamString}
                </Typography>
              </Tooltip>
              <Typography color="secondary">
                model:{server.darknetData?.minigameType}
              </Typography>
              <br />
              <div style={{ maxWidth: "300px" }}>
                <ServerSummary server={server} enableAuth={true} showDetails={true} />
              </div>{" "}
              <br />
              <br />
            </>
          ) : (
            <PasswordPrompt server={server} onClose={onClose} />
          )}
          {isLabServer && canEnterLabManually ? (
            ""
          ) : (
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
