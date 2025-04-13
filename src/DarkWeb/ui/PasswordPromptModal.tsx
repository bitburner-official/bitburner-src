import React, { useEffect, useRef, useState } from "react";
import { useRerender } from "../../ui/React/hooks";
import { Modal } from "../../ui/React/Modal";
import { checkPassword, getSharedChars, PasswordResponse, ResponseStatus } from "../models/DnetServerData";
import { Button, Container, SvgIcon, TextField, Typography } from "@mui/material";
import { sleep } from "../../Go/boardAnalysis/goAI";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { DarknetEvents, DarknetState } from "../models/DarknetState";
import { BaseServer } from "../../Server/BaseServer";
import { ServerSummary } from "./ServerSummary";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { LabyrinthSummary } from "./LabyrinthSummary";
import { Minigames } from "../controllers/DarknetServerGenerator";
import { dnetStyles } from "./dnetStyles";
import { ToastVariant } from "@enums";
import { SnackbarEvents } from "../../ui/React/Snackbar";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: BaseServer;
};

export const PasswordPromptModal = ({ open, onClose, server }: DWPasswordPromptModalProps): React.ReactElement => {
  const rerender = useRerender();
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? server.darknetData?.password ?? "" : "");
  const [password, setPassword] = useState<string>("?");
  const [enableSubmit, setEnableSubmit] = useState(!server.hasAdminRights);
  const [response, setResponse] = useState("Submit a password to login...");
  const [rawResponse, setRawResponse] = useState<PasswordResponse | null>(null);
  const [needsPasswordSubmit, setNeedsPasswordSubmit] = useState(true);
  const icon = getIcon(server.darknetData?.icon ?? Icon.Terminal);
  const passwordInput = useRef<HTMLInputElement>(null);
  const focusTarget = useRef<HTMLInputElement>(null);
  const location = DarknetState.labLocations[-1];
  const { classes } = dnetStyles({});

  useEffect(() => {
    async function attemptPassword(passwordAttempted: string, skipSleep = false): Promise<void> {
      setEnableSubmit(false);
      setResponse("Checking password...");

      const darknetData = server.darknetData;
      const sharedChars =
        darknetData?.minigameType === Minigames.TimingAttack
          ? getSharedChars(darknetData?.password ?? "", passwordAttempted)
          : 0;
      const extraTime = sharedChars * 150;
      await sleep(skipSleep ? 0 : 500 + extraTime);

      const response = checkPassword(passwordAttempted, server, skipSleep ? 0 : 4);
      setRawResponse(response);
      if (darknetData?.minigameType === Minigames.TimingAttack) {
        response.responseTime = 500 + extraTime;
      }
      setResponse(JSON.stringify(response, null, 4));

      if (response.status === ResponseStatus.SUCCESS) {
        DarknetEvents.emit("server-unlocked", server);
        await sleep(50);
        focusTarget.current?.focus();
      } else {
        setEnableSubmit(true);
        passwordInput.current?.focus();
        passwordInput.current?.querySelector("input")?.select();
      }
    }

    // Only call the password checker once per submit
    if (needsPasswordSubmit && open && !server.hasAdminRights) {
      void attemptPassword(password, password === "?");
      setNeedsPasswordSubmit(false);
    }
  }, [password, server, open, location, needsPasswordSubmit]);

  const handleSubmit = (e: React.FormEvent, passwordAttempted: string): void => {
    e.preventDefault();
    if (server.hasAdminRights) {
      onClose();
      return;
    }
    setPassword(passwordAttempted);
    setNeedsPasswordSubmit(true);
    rerender();
  };

  const copyHostname = (): void => {
    void navigator.clipboard.writeText(server.hostname);
    SnackbarEvents.emit(`Copied "${server.hostname}" to clipboard`, ToastVariant.SUCCESS, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} removeFocus={false}>
      <>
        <Container sx={{ width: "40vw" }}>
          <input ref={focusTarget} className={classes.hiddenInput}></input>
          <SvgIcon component={icon} color="secondary" />
          <Typography variant="h5" color={server.hasAdminRights ? "primary" : "secondary"} onClick={copyHostname}>
            {server.hostname}
          </Typography>
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
              <div style={{ maxWidth: "200px" }}>
                <ServerSummary server={server} enableAuth={true} />
              </div>{" "}
            </>
          ) : (
            <>
              <form onSubmit={(e) => handleSubmit(e, inputPassword)}>
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
              <Button onClick={(e) => handleSubmit(e, inputPassword)} disabled={!enableSubmit}>
                Submit Password
              </Button>
              <br />
              <br />
              {server.hostname === SpecialServers.Labyrinth ? (
                <LabyrinthSummary response={rawResponse} loadingText={response} />
              ) : (
                <Container sx={{ height: "200px" }}>
                  <div style={{ color: "white" }}>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
                  </div>
                </Container>
              )}
            </>
          )}
        </Container>
      </>
    </Modal>
  );
};
