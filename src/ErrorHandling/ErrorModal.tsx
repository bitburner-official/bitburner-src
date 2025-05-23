import React, {useEffect, useState} from "react";
import { makeStyles } from "tss-react/mui";
import { Modal } from "../ui/React/Modal";
import { Box, Button, Typography } from "@mui/material/";
import { ErrorRecord, ErrorState } from "./ErrorState";
import { Router } from "../ui/GameRoot";
import { SimplePage } from "@enums";
import { useRerender } from "../ui/React/hooks";
import { OptionSwitch } from "../ui/React/OptionSwitch";


export function ErrorModal(): React.ReactElement {
  const { classes } = useStyles();
  const rerender = useRerender();
  const [error, setError] = useState<ErrorRecord | null>(null);

  useEffect(() => {
    const listener = (error: ErrorRecord) => {
      if (Router.page() !== SimplePage.ActiveScripts && !ErrorState.PreventModals) {
        setError(error);
        rerender();
      }
    }
    ErrorState.ErrorUpdate.subscribe(listener);
  }, [rerender]);

  const onClose = (): void => {
    ErrorState.ActiveError = null;
    setError(null);
  }

  const viewLogs = (): void => {
    console.log("View Logs clicked");
    onClose();
  }

  const goToErrorPage = () => {
    onClose();
    ErrorState.UnreadErrors ||= 1;
    Router.toPage(SimplePage.ActiveScripts);
  }

  return (
    <Modal open={!!error} onClose={onClose}>
      {error ? <Typography>
        <h2>{error.errorType} ERROR</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{error.message.replaceAll("/", "/​")}</p>
        <p>Script: {error.scriptName}</p>
        <div>
          <OptionSwitch
            checked={ErrorState.PreventModals}
            onChange={(newValue) => (ErrorState.PreventModals = newValue)}
            text="Prevent more error modals"
            tooltip={<>If this is set, no error modals will be shown until the game is reloaded.</>}
          />
        </div>
        <Box className={classes.inlineFlexBox}>
          <Button onClick={onClose}>Close</Button>
          <div>
            <Button onClick={viewLogs}>View Logs</Button>
            <Button onClick={goToErrorPage}>Errors Page</Button>
          </div>
        </Box>
      </Typography> : ""}
    </Modal>
  );
}

const useStyles = makeStyles()(() => ({
  inlineFlexBox: {
    display: "inline-flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
}));