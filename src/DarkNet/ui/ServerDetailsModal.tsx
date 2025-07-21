import React, { useEffect, useRef } from "react";
import { Modal } from "../../ui/React/Modal";
import { Container, Card, SvgIcon, Typography, Tooltip } from "@mui/material";
import { getIcon, Icon } from "./ServerIcon";
import { DarknetEvents, getServerState } from "../models/DarknetState";
import { BaseServer } from "../../Server/BaseServer";
import { ServerSummary } from "./ServerSummary";
import { populateServerLogsWithNoise } from "../models/packetSniffing";
import { getLabyrinthDetails, isLabyrinthServer } from "../effects/labyrinth";
import { PasswordPrompt } from "./PasswordPrompt";
import { copyToClipboard, decolorJsonProperties, formatToMaxDigits } from "./uiUtilities";
import { useRerender } from "../../ui/React/hooks";
import { getDarknetData } from "../effects/effects";
import { sleep } from "../../Go/boardAnalysis/goAI";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: BaseServer;
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
  const rerender = useRerender();
  const darknetData = getDarknetData(server);
  const icon = getIcon(darknetData?.icon ?? Icon.Terminal);
  const focusTarget = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clearSubscription = DarknetEvents.subscribe(() => rerender());
    return () => {
      clearSubscription();
    };
  }, [rerender]);

  populateServerLogsWithNoise(server);
  const serverState = getServerState(server.hostname);
  const isLabServer = isLabyrinthServer(server.hostname);
  const canEnterLabManually = getLabyrinthDetails().manual;
  const recentLogs = serverState.serverLogs?.slice(0, 5) ?? [];
  const ramBlock = darknetData?.ramBlock ?? 0;
  const blockedRamString = ramBlock ? formatToMaxDigits(ramBlock, 1) + "+" : "";
  const usedRamString = formatToMaxDigits(server.ramUsed - ramBlock, 1);
  const serverRamString = `ram in use: ${blockedRamString}${usedRamString}/${server.maxRam} GB`;

  const logContent = recentLogs.map((log, index) => (
    <pre
      key={index}
      color="secondary"
      style={{ borderLeft: "1px solid grey", paddingLeft: "3px", whiteSpace: "normal" }}
    >
      {decolorJsonProperties(log)}
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
              <Typography>Password: "{darknetData?.password ?? ""}"</Typography>
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
              <Tooltip
                title={`Ram blocked by server owner: ${ramBlock} GB. Ram in use by scripts: ${
                  server.ramUsed - ramBlock
                } GB.`}
              >
                <Typography color="secondary">{serverRamString}</Typography>
              </Tooltip>
              <Typography color="secondary">model:{darknetData?.modelId}</Typography>
              <br />
              <div style={{ maxWidth: "300px" }}>
                <ServerSummary server={server} enableAuth={true} showDetails={true} classes={classes} />
              </div>{" "}
              <br />
              <br />
            </>
          ) : (
            <PasswordPrompt server={server} onClose={onClose} onSuccess={() => void onSuccess()} />
          )}
          {!(isLabServer && canEnterLabManually) && (
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
