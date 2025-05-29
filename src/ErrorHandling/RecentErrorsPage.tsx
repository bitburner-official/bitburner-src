import React from "react";
import { makeStyles } from "tss-react/mui";
import { ErrorRecord, ErrorState, killAllScripts } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import { Typography, Button } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { OptionSwitch } from "../ui/React/OptionSwitch";

export function RecentErrorsPage(): React.ReactElement {
  const rerender = useRerender();
  React.useEffect(() => {
    const listener = () => {
      rerender();
    };
    ErrorState.ErrorUpdate.subscribe(listener);
    ErrorState.ErrorPageOpen = true;
    ErrorState.UnreadErrors = 0;
  }, [rerender]);
  const { classes } = useStyles();

  const showError = (error: ErrorRecord): void => {
    ErrorState.ErrorUpdate.emit({ ...error, force: true });
  };

  const nthIndexOf = (string: string, pattern: string, n: number) => {
    let i = -1;

    while (n-- && i++ < string.length) {
      i = string.indexOf(pattern, i);
      if (i < 0) break;
    }
    return i;
  };

  const formatMessage = (message: string): string => {
    // Add zero-width space after each slash to allow clean wrapping
    const cleanedMessage = message.replaceAll("/", "/​");
    const fifthLineBreak = nthIndexOf(message, "\n", 5);
    if (fifthLineBreak !== -1) {
      // If the message has more than 4 line breaks, truncate it to the first 5 lines
      return cleanedMessage.slice(0, fifthLineBreak + 1) + " ...";
    }
    return cleanedMessage;
  };

  return (
    <div>
      <Typography>
        <h2>Recent Errors</h2>
      </Typography>
      <div className={classes.inlineFlexBox}>
        <OptionSwitch
          checked={ErrorState.PreventModals}
          onChange={(newValue) => (ErrorState.PreventModals = newValue)}
          text="Prevent error modals"
          tooltip={<>If this is set, no error modals will be shown until the game is reloaded.</>}
        />
        <Button color="error" onClick={killAllScripts}>
          Kill All Scripts
        </Button>
      </div>
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
    textOverflow: "ellipsis",
    whiteSpace: "pre-wrap",
  },
  xsmall: {
    maxWidth: "100px",
  },
  small: {
    maxWidth: "200px",
  },
  inlineFlexBox: {
    display: "inline-flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
}));
