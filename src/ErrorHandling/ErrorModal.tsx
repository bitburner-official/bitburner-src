import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { Modal } from "../ui/React/Modal";
import { Box, Button, Typography } from "@mui/material/";
import { errorModalsAreSuppressed, type ErrorRecord, ErrorState, toggleSuppressErrorModals } from "./ErrorState";
import { Router } from "../ui/GameRoot";
import { SimplePage, ToastVariant } from "@enums";
import { useRerender } from "../ui/React/hooks";
import { OptionSwitch } from "../ui/React/OptionSwitch";
import { LogBoxEvents } from "../ui/React/LogBoxManager";
import { recentScripts } from "../Netscript/RecentScripts";
import { SnackbarEvents } from "../ui/React/Snackbar";
import { Settings } from "../Settings/Settings";

export function ErrorModal(): React.ReactElement {
  const { classes } = useStyles();
  const rerender = useRerender();
  const [error, setError] = useState<ErrorRecord | null>(ErrorState.ActiveError);

  useEffect(() => {
    const listener = (newError: ErrorRecord) => {
      if (newError.force || (Router.page() !== SimplePage.RecentErrors && !errorModalsAreSuppressed())) {
        setError(newError);
        rerender();
      } else {
        ErrorState.ActiveError = null;
        setError(null);
      }
    };
    return ErrorState.ErrorUpdate.subscribe(listener);
  }, [rerender]);

  const onClose = (force = false): void => {
    ErrorState.ActiveError && (ErrorState.ActiveError.unread = false);

    if (force || errorModalsAreSuppressed()) {
      ErrorState.ActiveError = null;
      setError(null);
    } else {
      const nextError = ErrorState.Errors.find((e) => e.unread) ?? null;
      ErrorState.ActiveError = nextError;
      setError(nextError);
    }
    ErrorState.UnreadErrors = ErrorState.Errors.filter((e) => e.unread).length;
  };

  const viewLogs = (): void => {
    if (error === null) {
      return;
    }
    const recentScript = recentScripts.find((script) => script.runningScript.pid === error.pid);
    if (!recentScript) {
      SnackbarEvents.emit(`No recent script found with pid ${error.pid}`, ToastVariant.INFO, 2000);
      return;
    }
    onClose();
    LogBoxEvents.emit(recentScript.runningScript);
  };

  const goToErrorPage = () => {
    onClose(true);
    Router.toPage(SimplePage.RecentErrors);
  };

  return (
    <Modal open={!!error} onClose={() => onClose()}>
      {error && (
        <>
          <Typography component="div">
            <h2>{error.errorType} ERROR</h2>
            {/* Add a zero-width space after each slash to allow clean wrapping. */}
            <p style={{ whiteSpace: "pre-wrap" }}>{error.message.replaceAll("/", "/\u200B")}</p>
            <p>
              Script: {error.scriptName}
              <br />
              PID: {error.pid}
            </p>
            {!Settings.SuppressErrorModals && (
              <OptionSwitch
                checked={errorModalsAreSuppressed()}
                onChange={(newValue) => toggleSuppressErrorModals(newValue)}
                text="Suppress error modals (5 min)"
                tooltip={
                  <>
                    If this is set, no error modals will be shown for the next five minutes, and only log errors to the
                    Recent Errors page.
                  </>
                }
              />
            )}
          </Typography>
          <Box className={classes.inlineFlexBox}>
            <Button onClick={() => onClose()}>Close</Button>
            <div>
              <Button disabled={error.pid === -1} onClick={viewLogs}>
                View Script Logs
              </Button>
              <Button onClick={goToErrorPage}>Errors Page</Button>
            </div>
          </Box>
        </>
      )}
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
