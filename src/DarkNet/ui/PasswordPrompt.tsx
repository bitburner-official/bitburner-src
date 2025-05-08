import React, { useState, useRef } from "react";
import { Button, Container, Card, TextField, Typography } from "@mui/material";
import { getPasswordType, Minigames } from "../controllers/DarknetServerGenerator";
import { dnetStyles } from "./dnetStyles";
import { Result } from "@nsdefs";
import { BaseServer } from "../../Server/BaseServer";
import { PasswordResponse } from "../models/DnetServerData";
import { getAuthResult, getSharedChars } from "../models/authentication";
import { sleep } from "../../Go/boardAnalysis/goAI";
import { DarknetEvents } from "../models/DarknetState";
import { LabyrinthSummary } from "./LabyrinthSummary";
import { getLabyrinthDetails, isLabyrinthServer } from "../models/labyrinth";

export type PasswordPromptProps = {
  server: BaseServer;
  onClose: () => void;
};

export const PasswordPrompt = ({ server, onClose }: PasswordPromptProps): React.ReactElement => {
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? server.darknetData?.password ?? "" : "");
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [response, setResponse] = useState("(no response yet)");
  const [rawResponse, setRawResponse] = useState<{ result: Result; response: PasswordResponse } | null>(null);
  const { classes } = dnetStyles({});

  const passwordInput = useRef<HTMLInputElement>(null);
  const focusTarget = useRef<HTMLInputElement>(null);
  const isLabServer = isLabyrinthServer(server.hostname);
  const canEnterLabManually = getLabyrinthDetails().manual;
  const disablePasswordInput = (!canEnterLabManually && isLabServer) || server.hasAdminRights;

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
    DarknetEvents.emit();
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (server.hasAdminRights) {
      onClose();
      return;
    }
    if (enableSubmit) {
      void attemptPassword(inputPassword);
    }
  };

  if (isLabServer && !canEnterLabManually) {
    return (
      <>
        <Typography>
          The weight of the deep net presses down on you. It seems this place will challenge you to make your own
          tools...
        </Typography>
      </>
    );
  }

  return (
    <>
      <div className={classes.inlineFlexBox}>
        <div>
          <input ref={focusTarget} className={classes.hiddenInput}></input>
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
              disabled={disablePasswordInput}
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
                <span className={classes.serverDetailsText}>hint:</span> {server.darknetData?.staticPasswordHint}
                <br />
                {server.darknetData?.passwordHintData ? (
                  <>
                    <span className={classes.serverDetailsText}>data:</span>
                    {server.darknetData?.passwordHintData}
                    <br />
                  </>
                ) : (
                  ""
                )}
                <span className={classes.serverDetailsText}>length:</span> {server.darknetData?.password?.length}
                <br />
                <span className={classes.serverDetailsText}>format:</span>{" "}
                {getPasswordType(server.darknetData?.password ?? "")}
                <br />
                <span className={classes.serverDetailsText}>model:</span> {server.darknetData?.minigameType ?? ""}
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
      {isLabServer ? (
        <LabyrinthSummary
          result={rawResponse?.result}
          lastMovementFeedback={rawResponse?.response?.message}
          loadingText={response}
        />
      ) : (
        ""
      )}
    </>
  );
};
