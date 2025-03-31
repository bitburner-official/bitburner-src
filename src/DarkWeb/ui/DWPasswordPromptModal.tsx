import React, { useEffect, useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { checkPassword, SUCCESS_STATUS } from "../models/DarkWebServerData";
import { Container, Typography, TextField, Button } from "@mui/material";
import { sleep } from "../../Go/boardAnalysis/goAI";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { DarkWebEvents } from "../models/DarkWebState";
import { BaseServer } from "../../Server/BaseServer";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: BaseServer;
};

export const DWPasswordPromptModal = ({ open, onClose, server }: DWPasswordPromptModalProps): React.ReactElement => {
  const [inputPassword, setInputPassword] = useState(server.hasAdminRights ? server.darkWebData?.password ?? "" : "");
  const [password, setPassword] = useState<string>("?");
  const [enableSubmit, setEnableSubmit] = useState(!server.hasAdminRights);
  const [response, setResponse] = useState("Submit a password to login...");
  const icon = getIcon(server.darkWebData?.icon ?? Icon.Terminal);

  useEffect(() => {
    async function attemptPassword(passwordAttempted: string, skipSleep = false): Promise<void> {
      setEnableSubmit(false);
      setResponse("Checking password...");
      await sleep(skipSleep ? 0 : 500);
      const response = checkPassword(passwordAttempted, server, skipSleep ? 0 : 4);
      setResponse(JSON.stringify(response, null, 4));
      if (response.status == SUCCESS_STATUS) {
        DarkWebEvents.emit("server-unlocked", server);
      } else {
        setEnableSubmit(true);
      }
    }
    open && !server.hasAdminRights && void attemptPassword(password, password === "?");
  }, [password, server, open]);

  const handleSubmit = (e: React.FormEvent, passwordAttempted: string): void => {
    e.preventDefault();
    if (server.hasAdminRights) {
      onClose();
      return;
    }
    setPassword(passwordAttempted);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Container sx={{ width: "40vw" }}>
          {React.createElement(icon, { color: "secondary" })}
          <Typography variant="h5" color={server.hasAdminRights ? "primary" : "secondary"}>
            {server.hostname}
          </Typography>
          <br />
          <form onSubmit={(e) => handleSubmit(e, inputPassword)}>
            <TextField
              id="pw-input"
              label="Password"
              type="text"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              variant="outlined"
              autoComplete="off"
              autoFocus={true}
            />
          </form>
          <br />
          <Button onClick={() => setPassword(inputPassword)} disabled={!enableSubmit}>
            Submit Password
          </Button>
          <br />
          <br />
          <Container sx={{ height: "200px" }}>
            <div style={{ color: "white", whiteSpace: "pre-wrap" }}>
              <pre>{response}</pre>
            </div>
          </Container>
        </Container>
      </>
    </Modal>
  );
};
