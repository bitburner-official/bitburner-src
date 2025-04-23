import React, { useRef, useState } from "react";
import { useRerender } from "../../ui/React/hooks";
import { Modal } from "../../ui/React/Modal";
import { PasswordResponse } from "../models/DnetServerData";
import { Button, Container, Card, SvgIcon, TextField, Typography } from "@mui/material";
import { sleep } from "../../Go/boardAnalysis/goAI";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { DarknetEvents, getServerState } from "../models/DarknetState";
import { BaseServer } from "../../Server/BaseServer";
import { ServerSummary } from "./ServerSummary";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { LabyrinthSummary } from "./LabyrinthSummary";
import { getPasswordType, Minigames } from "../controllers/DarknetServerGenerator";
import { dnetStyles } from "./dnetStyles";
import { ToastVariant } from "@enums";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { Result } from "@nsdefs";
import { getAuthResult, getSharedChars } from "../models/authentication";
import { populateServerLogsWithNoise } from "../models/packetSniffing";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: BaseServer;
};

export const PasswordPromptModal = ({ open, onClose, server }: DWPasswordPromptModalProps): React.ReactElement => {
  const rerender = useRerender();
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? server.darknetData?.password ?? "" : "");
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [response, setResponse] = useState("(no response yet)");
  const [rawResponse, setRawResponse] = useState<{ result: Result; response: PasswordResponse } | null>(null);

  const icon = getIcon(server.darknetData?.icon ?? Icon.Terminal);
  const passwordInput = useRef<HTMLInputElement>(null);
  const focusTarget = useRef<HTMLInputElement>(null);
  const { classes } = dnetStyles({});

  async function attemptPassword(passwordAttempted: string): Promise<void> {
    setEnableSubmit(false);
    setResponse("Checking password...");

    const darknetData = server.darknetData;
    const sharedChars =
      darknetData?.minigameType === Minigames.TimingAttack
        ? getSharedChars(darknetData?.password ?? "", passwordAttempted)
        : 0;
    const responseTime = 500 + sharedChars * 150;
    await sleep(responseTime);

    const response = getAuthResult(passwordAttempted, server, 4, responseTime);
    setRawResponse(response);
    setResponse(JSON.stringify(response.result, null, 2));

    if (response.result.success) {
      DarknetEvents.emit("server-unlocked", server);
      await sleep(50);
      focusTarget.current?.focus();
    } else {
      setEnableSubmit(true);
      passwordInput.current?.focus();
      passwordInput.current?.querySelector("input")?.select();
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (server.hasAdminRights) {
      onClose();
      return;
    }
    void attemptPassword(inputPassword);
    rerender();
  };

  const copyHostname = (): void => {
    void navigator.clipboard.writeText(server.hostname);
    SnackbarEvents.emit(`Copied "${server.hostname}" to clipboard`, ToastVariant.SUCCESS, 2000);
  };

  const decolorProperties = (logLine: string) => {
    let result;
    try {
      result = JSON.parse(logLine) as PasswordResponse;
    } catch (e) {
      return logLine;
    }

    return (
      <>
        <span style={{ color: "grey" }}>message: </span>
        {result?.message ?? ""}
        <br />
        {result?.data ? (
          <>
            <span style={{ color: "grey" }}>data: </span>
            {result.data}
            <br />
          </>
        ) : (
          ""
        )}
        <span style={{ color: "grey" }}>passwordAttempted: </span>
        {result?.passwordAttempted ?? ""}
        <br />
        <span style={{ color: "grey" }}>status: </span>
        {result?.status ?? ""}
        <br />
      </>
    );
  };

  populateServerLogsWithNoise(server);
  const serverState = getServerState(server.hostname);
  const recentLogs = serverState.serverLogs?.slice(0, 5) ?? [];
  const logContent = recentLogs.map((log, index) => (
    <pre
      key={index}
      color="secondary"
      style={{ borderLeft: "1px solid grey", paddingLeft: "3px", whiteSpace: "normal" }}
    >
      {decolorProperties(log)}
    </pre>
  ));

  return (
    <Modal open={open} onClose={onClose} removeFocus={false}>
      <>
        <Container sx={{ width: "calc(min(700px, 80vw))", minHeight: "500px" }}>
          <input ref={focusTarget} className={classes.hiddenInput}></input>
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
              {server.hostname === SpecialServers.Labyrinth ? (
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
              <Typography color="secondary">
                ram:{server.maxRam}GB model:{server.darknetData?.minigameType}
              </Typography>
              <br />
              <div style={{ maxWidth: "300px" }}>
                <ServerSummary server={server} enableAuth={true} showDetails={true} />
              </div>{" "}
              <br />
              <br />
            </>
          ) : (
            <>
              <br />
              <div className={classes.inlineFlexBox}>
                <div>
                  <form onSubmit={(e) => handleSubmit(e)}>
                    <TextField
                      ref={passwordInput}
                      id="pw-input"
                      label="Password"
                      type="text"
                      value={inputPassword}
                      onChange={(e) => setInputPassword(e.target.value)}
                      variant="outlined"
                      autoComplete="off"
                      autoFocus={!server.hasAdminRights}
                      disabled={server.hasAdminRights}
                    />
                  </form>
                  <br />
                  <Button onClick={(e) => handleSubmit(e)} disabled={!enableSubmit}>
                    Submit Password
                  </Button>
                  <br />
                  <br />
                  <br />
                  <Typography variant="caption" color="secondary">
                    Logs scraped via <pre style={{ display: "inline" }}>heartbleed</pre>:
                  </Typography>
                </div>
                <div style={{ width: "50%" }}>
                  <Container disableGutters>
                    <div style={{ color: "white" }}>
                      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                        <span style={{ color: "grey" }}>hint:</span> {server.darknetData?.staticPasswordHint}
                        <br />
                        {server.darknetData?.passwordHintData ? (
                          <>
                            <span style={{ color: "grey" }}>data:</span>
                            {server.darknetData?.passwordHintData}
                            <br />
                          </>
                        ) : (
                          ""
                        )}
                        <span style={{ color: "grey" }}>length:</span> {server.darknetData?.password?.length}
                        <br />
                        <span style={{ color: "grey" }}>format:</span>{" "}
                        {getPasswordType(server.darknetData?.password ?? "")}
                        <br />
                      </pre>
                    </div>
                  </Container>
                  <br />
                  <Card style={{ padding: "8px", minHeight: "60px", marginBottom: "8px" }}>
                    <div style={{ color: "white" }}>
                      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{response}</pre>
                    </div>
                  </Card>
                </div>
              </div>
              <br />
              {server.hostname === SpecialServers.Labyrinth ? (
                <LabyrinthSummary
                  result={rawResponse?.result}
                  lastMovementFeedback={rawResponse?.response?.message}
                  loadingText={response}
                />
              ) : (
                ""
              )}
            </>
          )}
          {server.hostname === SpecialServers.Labyrinth ? (
            ""
          ) : (
            <>
              <Card style={{ height: "250px", overflowY: "scroll" }} onScroll={(e) => e.preventDefault()}>
                <div style={{ color: "white", paddingLeft: "10px" }}>{logContent}</div>
              </Card>
            </>
          )}
        </Container>
      </>
    </Modal>
  );
};
