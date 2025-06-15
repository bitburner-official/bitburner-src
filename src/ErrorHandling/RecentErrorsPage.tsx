import React, { useEffect } from "react";
import { makeStyles } from "tss-react/mui";
import { type ErrorRecord, ErrorState } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import { Typography, Tooltip } from "@mui/material";
import { Theme } from "@mui/material/styles";

export function RecentErrorsPage(): React.ReactElement {
  const rerender = useRerender();
  React.useEffect(() => {
    const clearSubscription = ErrorState.ErrorUpdate.subscribe(rerender);
    ErrorState.UnreadErrors = 0;
    return () => {
      clearSubscription();
      ErrorState.UnreadErrors = 0;
    };
  }, [rerender]);

  useEffect(() => {
    ErrorState.Errors.forEach((error) => {
      error.unread = false; // Mark all errors as read when the page is loaded
    });
  }, []);

  const { classes } = useStyles();

  const showError = (error: ErrorRecord): void => {
    ErrorState.ErrorUpdate.emit({ ...error, force: true });
  };

  const formatMessage = (message: string): string => {
    /**
     * - Add a zero-width space after each slash to allow clean wrapping.
     * - Replace 2+ newline characters with only 1 newline character to reduce the number of empty lines.
     */
    return message.replaceAll("/", "/\u200B").replaceAll(/\n{2,}/g, "\n");
  };

  return (
    <div>
      <Typography component="div" sx={{ height: "100vh", overflowY: "auto", scrollbarWidth: "thin" }}>
        <table className={classes.errorTable}>
          <thead>
            <tr>
              <th className={classes.cellText}>Count</th>
              <th className={classes.cellText}>Type</th>
              <th className={classes.cellText}>Message</th>
              <th className={classes.cellText}>Script</th>
              <th className={classes.cellText}>Time</th>
            </tr>
          </thead>
          <tbody>
            {ErrorState.Errors.map((e, i) => (
              <tr key={i} className={classes.errorRow} onClick={() => showError(e)}>
                <td className={classes.cellText}>
                  <div className={classes.xsmall}>{e.occurrences}</div>
                </td>
                <td className={classes.cellText}>
                  <div className={classes.xsmall}>{e.errorType}</div>
                </td>
                <td>
                  <div className={classes.errorText} key={i}>
                    {formatMessage(e.message)}
                  </div>
                </td>
                <td className={classes.cellText}>
                  <div className={classes.small}>
                    <Tooltip title={<>{formatMessage(e.scriptName)}</>}>
                      <div style={{ textOverflow: "ellipsis", overflow: "auto" }}>{formatMessage(e.scriptName)}</div>
                    </Tooltip>
                  </div>
                </td>
                <td className={classes.cellText}>
                  <div className={classes.xsmall}>{e.time.toLocaleString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Typography>
    </div>
  );
}

const useStyles = makeStyles()((theme: Theme) => ({
  errorTable: {
    width: "100%",
    maxWidth: "100%",
    borderCollapse: "collapse",
  },
  errorRow: {
    borderTop: `1px solid ${theme.colors.button}`,
    "&:hover": {
      backgroundColor: theme.colors.button,
    },
  },
  cellText: {
    verticalAlign: "top",
    padding: "4px",
    textAlign: "left",
  },
  errorText: {
    margin: "4px",
    color: "white",
    textOverflow: "ellipsis",
    whiteSpace: "pre-wrap",
    lineClamp: "6",
    lineHeight: 1.1,
    overflowX: "auto",
    maxHeight: "200px",
  },
  xsmall: {
    maxWidth: "110px",
    fontSize: "14px",
    lineHeight: 1.2,
  },
  small: {
    maxWidth: "200px",
  },
}));
