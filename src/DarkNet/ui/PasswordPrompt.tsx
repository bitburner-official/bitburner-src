import React, { useState, useRef } from "react";
import { Button, Container, Card, TextField, Typography } from "@mui/material";
import { getPasswordType } from "../controllers/ServerGenerator";
import { dnetStyles } from "./dnetStyles";
import type { DarknetResult } from "@nsdefs";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { getAuthResult } from "../effects/authentication";
import { DarknetEvents } from "../models/DarknetState";
import { LabyrinthSummary } from "./LabyrinthSummary";
import { getLabyrinthDetails, isLabyrinthServer } from "../effects/labyrinth";
import { ModelIds } from "../Enums";
import { sleep } from "../../utils/Utility";
import { getSharedChars } from "../utils/darknetAuthUtils";
import type { DarknetServer } from "../../Server/DarknetServer";

export type PasswordPromptProps = {
  server: DarknetServer;
  onClose: () => void;
  onSuccess: () => void;
};

export const PasswordPrompt = ({ server, onClose, onSuccess }: PasswordPromptProps): React.ReactElement => {
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? server.password : "");
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [response, setResponse] = useState("(no response yet)");
  const [rawResponse, setRawResponse] = useState<{ result: DarknetResult; response: PasswordResponse } | null>(null);
  const { classes } = dnetStyles({});

  const passwordInput = useRef<HTMLInputElement>(null);
  const focusTarget = useRef<HTMLInputElement>(null);
  const isLabServer = isLabyrinthServer(server.hostname);
  const canEnterLabManually = getLabyrinthDetails().manual;
  const disablePasswordInput = (!canEnterLabManually && isLabServer) || server.hasAdminRights;

  async function attemptPassword(passwordAttempted: string): Promise<void> {
    setEnableSubmit(false);
    setResponse("Checking password...");

    const sharedChars =
      server.modelId === ModelIds.TimingAttack ? getSharedChars(server.password, passwordAttempted) : 0;
    const responseTime = 500 + sharedChars * 150;
    await sleep(responseTime);

    // Manual password entry counts as having two threads, to increase the cha xp slightly during early exploration
    const response = getAuthResult(server, passwordAttempted, 2, responseTime);
    setRawResponse(response);
    setResponse(JSON.stringify(response.result, null, 2));

    if (response.result.success) {
      DarknetEvents.emit("server-unlocked", server);
      onSuccess();
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
      attemptPassword(inputPassword).catch((error) => console.error(error));
    }
  };

  if (isLabServer && !canEnterLabManually) {
    return (
      <>
        <br />
        <br />
        <Typography>
          The weight of the deep net presses down on you. It seems this place will challenge you to make your own
          tools...
        </Typography>
        <br />
        <br />
        <LabyrinthSummary
          result={rawResponse?.result}
          lastMovementFeedback={rawResponse?.response?.message}
          loadingText={response}
        />
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
          {!isLabServer && (
            <Typography variant="caption" color="secondary">
              Logs scraped via <pre style={{ display: "inline" }}>heartbleed</pre>:
            </Typography>
          )}
        </div>
        <div style={{ width: "50%" }}>
          <Container disableGutters>
            <div style={{ color: "white" }}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                <span className={classes.serverDetailsText}>hint:</span> {server.staticPasswordHint}
                <br />
                {server.passwordHintData && (
                  <>
                    <span className={classes.serverDetailsText}>data: </span> {server.passwordHintData}
                    <br />
                  </>
                )}
                {!isLabServer && (
                  <>
                    <span className={classes.serverDetailsText}>length:</span> {server.password.length}
                    <br />
                    <span className={classes.serverDetailsText}>format:</span> {getPasswordType(server.password)}
                    <br />
                  </>
                )}
                <span className={classes.serverDetailsText}>model:</span> {server.modelId}
                <br />
                {isLabServer && (
                  <>
                    <span className={classes.serverDetailsText}>cha:</span> {server.requiredCharismaSkill}
                    <br />
                  </>
                )}
              </pre>
            </div>
          </Container>
          <br />
          {!isLabServer && (
            <Card style={{ padding: "8px", minHeight: "60px", marginBottom: "8px" }}>
              <div style={{ color: "white" }}>
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{response}</pre>
              </div>
            </Card>
          )}
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
