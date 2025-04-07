import React, { useEffect, useState, useRef } from "react";
import { useRerender } from "../../ui/React/hooks";
import { Modal } from "../../ui/React/Modal";
import { checkPassword, PasswordResponse, SUCCESS_STATUS } from "../models/DnetServerData";
import { Container, Typography, TextField, Button, SvgIcon } from "@mui/material";
import { sleep } from "../../Go/boardAnalysis/goAI";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { DarknetEvents, DarknetState } from "../models/DarknetState";
import { BaseServer } from "../../Server/BaseServer";
import { ServerSummary } from "./ServerSummary";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { LabyrinthSummary } from "./LabyrinthSummary";

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
  const location = DarknetState.labLocations[-1];

  useEffect(() => {
    async function attemptPassword(passwordAttempted: string, skipSleep = false): Promise<void> {
      setEnableSubmit(false);
      setResponse("Checking password...");
      await sleep(skipSleep ? 0 : 500);
      const response = checkPassword(passwordAttempted, server, skipSleep ? 0 : 4);
      setRawResponse(response);
      setResponse(JSON.stringify(response, null, 4));
      if (response.status == SUCCESS_STATUS) {
        DarknetEvents.emit("server-unlocked", server);
      } else {
        setEnableSubmit(true);
        passwordInput.current?.focus();
        passwordInput.current?.querySelector("input")?.select()
      }
    }
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

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Container sx={{ width: "40vw" }}>
          <SvgIcon component={icon} color="secondary" />
          <Typography variant="h5" color={server.hasAdminRights ? "primary" : "secondary"}>
            {server.hostname}
          </Typography>
          <br />
          {server.hasAdminRights ? ( <>
            <Typography>Password: {server.darknetData?.password ?? ""}</Typography>
              <br/>
              <br/>
              {server.hostname === SpecialServers.Labyrinth ? (
                <Typography>You have successfully navigated the labyrinth! Congratulations!</Typography>
              ) : ""}
              <div style={{maxWidth: "200px"}}>
                <ServerSummary server={server} enableAuth={true}/>
              </div> </>
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
            <Button onClick={() => setPassword(inputPassword)} disabled={!enableSubmit}>
              Submit Password
            </Button>
            <br />
            <br />
              {server.hostname === SpecialServers.Labyrinth ? (
                <LabyrinthSummary response={rawResponse} loadingText={response} /> ) : (
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
