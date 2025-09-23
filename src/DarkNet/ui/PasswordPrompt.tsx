import React, { useState, useRef } from "react";
import { Button, Container, Card, TextField, Typography } from "@mui/material";
import { getPasswordType } from "../controllers/ServerGenerator";
import { dnetStyles } from "./dnetStyles";
import { Result } from "@nsdefs";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { getAuthResult } from "../effects/authentication";
import { DarknetEvents } from "../models/DarknetState";
import { LabyrinthSummary } from "./LabyrinthSummary";
import { getLabyrinthDetails, isLabyrinthServer } from "../effects/labyrinth";
import { BaseServer } from "../../Server/BaseServer";
import { ModelIds } from "../Enums";
import { sleep } from "../../utils/Utility";
import { getDarknetData } from "../utils/darknetServerUtils";
import { getSharedChars } from "../utils/darknetAuthUtils";

export type PasswordPromptProps = {
  server: BaseServer;
  onClose: () => void;
  onSuccess: () => void;
};

export const PasswordPrompt = ({ server, onClose, onSuccess }: PasswordPromptProps): React.ReactElement => {
  const darknetData = getDarknetData(server);
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? darknetData?.password ?? "" : "");
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

    const sharedChars =
      darknetData?.modelId === ModelIds.TimingAttack
        ? getSharedChars(darknetData?.password ?? "", passwordAttempted)
        : 0;
    const responseTime = 500 + sharedChars * 150;
    await sleep(responseTime);

    const response = getAuthResult(passwordAttempted, server, 2, responseTime);
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
      void attemptPassword(inputPassword);
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
          <Typography variant="caption" color="secondary">
            Logs scraped via <pre style={{ display: "inline" }}>heartbleed</pre>:
          </Typography>
        </div>
        <div style={{ width: "50%" }}>
          <Container disableGutters>
            <div style={{ color: "white" }}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                <span className={classes.serverDetailsText}>hint:</span> {darknetData?.staticPasswordHint}
                <br />
                {darknetData?.passwordHintData && (
                  <>
                    <span className={classes.serverDetailsText}>data: </span> {darknetData?.passwordHintData}
                    <br />
                  </>
                )}
                {!isLabServer && (
                  <>
                    <span className={classes.serverDetailsText}>length:</span> {darknetData?.password?.length}
                    <br />
                    <span className={classes.serverDetailsText}>format:</span>{" "}
                    {getPasswordType(darknetData?.password ?? "")}
                    <br />
                  </>
                )}
                <span className={classes.serverDetailsText}>model:</span> {darknetData?.modelId ?? ""}
                <br />
                {isLabServer && (
                  <>
                    <span className={classes.serverDetailsText}>cha:</span> {darknetData?.requiredCharismaSkill ?? ""}
                    <br />
                  </>
                )}
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
