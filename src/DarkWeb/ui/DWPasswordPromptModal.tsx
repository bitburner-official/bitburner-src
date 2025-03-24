import React, { useEffect, useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { checkPassword, SUCCESS_STATUS } from "../models/DarkWebServerData";
import { Container, Typography, TextField, Button } from "@mui/material";
import { sleep } from "../../Go/boardAnalysis/goAI";
import { getIcon } from "../controllers/ServerIcon";
import { DarkWebEvents } from "../models/DarkWebState";
import { Server } from "../../Server/Server";

export type DWPasswordPromptModalProps = {
  open: boolean;
  onClose: () => void;
  server: Server;
};

export const DWPasswordPromptModal = ({ open, onClose, server }: DWPasswordPromptModalProps): React.ReactElement => {
  const [inputPassword, setInputPassword] = useState("");
  const [password, setPassword] = useState<string>("?");
  const [enableSubmit, setEnableSubmit] = useState(!server.hasAdminRights);
  const [response, setResponse] = useState("Submit a password to login...");

  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Dark web server missing dark web data");
  }

  useEffect(() => {
    async function attemptPassword(passwordAttempted: string, skipSleep = false): Promise<void> {
      setEnableSubmit(false);
      setResponse("Checking password...");
      await sleep(skipSleep ? 0 : 500);
      const response = checkPassword(passwordAttempted, server);
      setResponse(JSON.stringify(response, null, 4));
      if (response.status == SUCCESS_STATUS) {
        DarkWebEvents.emit("server-unlocked", server);
      } else {
        setEnableSubmit(true);
      }
    }
    open && void attemptPassword(password, password === "?");
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
          {React.createElement(getIcon(darkWebData.icon), { color: "secondary" })}
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
