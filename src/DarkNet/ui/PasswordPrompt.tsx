import React, { useState, useRef } from "react";
import { Button, Container, Card, TextField, Typography } from "@mui/material";
import { getPasswordType } from "../controllers/ServerGenerator";
import { dnetStyles } from "./dnetStyles";
import type { DarknetResult } from "@nsdefs";
import { getAuthResult } from "../effects/authentication";
import { DarknetEvents } from "../models/DarknetState";
import { LabyrinthSummary } from "./LabyrinthSummary";
import { getLabyrinthDetails, isLabyrinthServer } from "../effects/labyrinth";
import { ModelIds } from "../Enums";
import { sleep } from "../../utils/Utility";
import { getSharedChars } from "../utils/darknetAuthUtils";
import type { DarknetServer } from "../../Server/DarknetServer";
import { formatObjectWithColoredKeys } from "./uiUtilities";

export type PasswordPromptProps = {
  server: DarknetServer;
  onClose: () => void;
};

export const PasswordPrompt = ({ server, onClose }: PasswordPromptProps): React.ReactElement => {
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? server.password : "");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lastDarknetResultFromAuth, setLastDarknetResultFromAuth] = useState<DarknetResult | null>(null);
  const { classes } = dnetStyles({});

  const passwordInput = useRef<HTMLInputElement>(null);
  const isLabServer = isLabyrinthServer(server.hostname);
  const canEnterLabManually = getLabyrinthDetails().manual;
  const disablePasswordInput = (!canEnterLabManually && isLabServer) || server.hasAdminRights;

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
        <LabyrinthSummary isAuthenticating={isAuthenticating} />
      </>
    );
  }

  async function attemptPassword(passwordAttempted: string): Promise<void> {
    setIsAuthenticating(true);

    const sharedChars =
      server.modelId === ModelIds.TimingAttack ? getSharedChars(server.password, passwordAttempted) : 0;
    const responseTime = 500 + sharedChars * 150;
    await sleep(responseTime);
    // Cancel if the component unmounted while waiting
    if (passwordInput.current === null) {
      return;
    }

    // Manual password entry counts as having two threads, to increase the cha xp slightly during early exploration
    const authResult = getAuthResult(server, passwordAttempted, 2, responseTime);

    // Do NOT carelessly move these setters, especially when moving them to after DarknetEvents.emit().
    // DarknetEvents.emit() makes the parent component rerender, so this component may be unmounted. In that case,
    // these calls will set the states of an unmounted component.
    setIsAuthenticating(false);
    setLastDarknetResultFromAuth(authResult.result);

    if (authResult.result.success) {
      DarknetEvents.emit();
    } else {
      // This selects the text inside the password input field so that the player can immediately start typing a new
      // guess without needing to clear out the old one.
      // Do NOT move this line below DarknetEvents.emit(). DarknetEvents.emit() may make this component unmounted, so
      // passwordInput.current may become null unexpectedly. Using the optional chaining operator for accessing
      // passwordInput.current is specifically for the case in which somebody mistakenly moves this line.
      passwordInput.current?.querySelector("input")?.select();
      DarknetEvents.emit();
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (server.hasAdminRights) {
      onClose();
      return;
    }
    if (!isAuthenticating) {
      attemptPassword(inputPassword).catch((error) => console.error(error));
    }
  };

  let authFeedback;
  if (isAuthenticating) {
    authFeedback = "Checking password...";
  } else {
    if (lastDarknetResultFromAuth === null) {
      authFeedback = "(no response yet)";
    } else {
      authFeedback = formatObjectWithColoredKeys(lastDarknetResultFromAuth, ["success", "message", "code"]);
    }
  }

  return (
    <>
      <div className={classes.inlineFlexBox}>
        <div>
          <form onSubmit={(e) => handleSubmit(e)}>
            <TextField
              ref={passwordInput}
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
          <Button onClick={(e) => handleSubmit(e)} disabled={isAuthenticating}>
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
            {isLabServer ? (
              <div style={{ color: "white" }}>
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  <span className={classes.serverDetailsText}>Hint:</span> {server.staticPasswordHint}
                  <br />
                  <span className={classes.serverDetailsText}>Model:</span> {server.modelId}
                  <br />
                  <span className={classes.serverDetailsText}>Required charisma:</span> {server.requiredCharismaSkill}
                  <br />
                </pre>
              </div>
            ) : (
              <div style={{ color: "white" }}>
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  <span className={classes.serverDetailsText}>Hint:</span> {server.staticPasswordHint}
                  <br />
                  {!!server.passwordHintData && (
                    <>
                      <span className={classes.serverDetailsText}>Data: </span> {server.passwordHintData}
                      <br />
                    </>
                  )}
                  <span className={classes.serverDetailsText}>Length:</span> {server.password.length}
                  <br />
                  <span className={classes.serverDetailsText}>Format:</span> {getPasswordType(server.password)}
                  <br />
                  <span className={classes.serverDetailsText}>Model:</span> {server.modelId}
                  <br />
                </pre>
              </div>
            )}
          </Container>
          <br />
          {!isLabServer && (
            <Card style={{ padding: "8px", minHeight: "60px", marginBottom: "8px" }}>
              <div style={{ color: "white" }}>
                {typeof authFeedback !== "string" ? (
                  authFeedback
                ) : (
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{authFeedback}</pre>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
      <br />
      {isLabServer && <LabyrinthSummary isAuthenticating={isAuthenticating} />}
    </>
  );
};
