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
      SnackbarEvents.emit(`未找到 pid 为 ${error.pid} 的最近脚本`, ToastVariant.INFO, 2000);
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
            <h2>{error.errorType} 错误</h2>
            {/* Add a zero-width space after each slash to allow clean wrapping. */}
            <p style={{ whiteSpace: "pre-wrap" }}>{error.message.replaceAll("/", "/\u200B")}</p>
            <p>
              脚本：{error.scriptName}
              <br />
              PID：{String(error.pid)}
            </p>
            {!Settings.SuppressErrorModals && (
              <OptionSwitch
                checked={errorModalsAreSuppressed()}
                onChange={(newValue) => toggleSuppressErrorModals(newValue)}
                text="抑制错误弹窗（5 分钟）"
                tooltip={
                  <>
                    如果启用此选项，接下来五分钟内将不再显示错误弹窗，错误只会记录到“近期错误”页面。
                  </>
                }
              />
            )}
          </Typography>
          <Box className={classes.inlineFlexBox}>
            <Button onClick={() => onClose()}>关闭</Button>
            <div>
              <Button disabled={error.pid === undefined} onClick={viewLogs}>
                查看脚本日志
              </Button>
              <Button onClick={goToErrorPage}>错误页面</Button>
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
