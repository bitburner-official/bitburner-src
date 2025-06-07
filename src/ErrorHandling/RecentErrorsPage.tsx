import React from "react";
import { makeStyles } from "tss-react/mui";
import { ErrorRecord, ErrorState } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import { Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";

export function RecentErrorsPage(): React.ReactElement {
  const rerender = useRerender();
  React.useEffect(() => {
    const listener = () => {
      rerender();
    };
    ErrorState.ErrorUpdate.subscribe(listener);
    ErrorState.UnreadErrors = 0;
  }, [rerender]);
  const { classes } = useStyles();

  const showError = (error: ErrorRecord): void => {
    ErrorState.ErrorUpdate.emit({ ...error, force: true });
  };

  const formatMessage = (message: string): string => {
    // Add zero-width space after each slash to allow clean wrapping
    return message.replaceAll("/", "/\u200B");
  };

  return (
    <div>
      <Typography>
        <table className={classes.errorTable}>
          <thead>
            <tr>
              <th>Count</th>
              <th>Type</th>
              <th style={{ textAlign: "start" }}>Message</th>
              <th>Script</th>
              <th>Time</th>
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
                  <div className={classes.small}>{formatMessage(e.scriptName)}</div>
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
    padding: "8px",
  },
  errorText: {
    margin: "8px",
    color: "white",
    maxWidth: "50vw",
    whiteSpace: "pre-wrap",
    "overflow-x": "auto",
    maxHeight: "200px",
  },
  xsmall: {
    maxWidth: "110px",
  },
  small: {
    maxWidth: "200px",
  },
}));
