import React from "react";
import { makeStyles } from "tss-react/mui";
import { ErrorState } from "./ErrorState";
import { useRerender } from "../ui/React/hooks";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";
import { OptionSwitch } from "../ui/React/OptionSwitch";


export function RecentErrorsPage(): React.ReactElement {
  const rerender = useRerender();
  let unsub : (() => void) | undefined = undefined;
  React.useEffect(() => {
    const listener = () => {
      rerender();
    }
    unsub = ErrorState.ErrorUpdate.subscribe(listener);
    ErrorState.ErrorPageOpen = true;
    ErrorState.UnreadErrors = 0;
  }, [rerender]);
  React.useEffect(() => {
    return () => {
      unsub?.();
      ErrorState.ErrorPageOpen = false;
    };
  }, [unsub]);
  const { classes } = useStyles();

  return (
    <div>
      <h2>Recent Errors</h2>
      <div>
        <OptionSwitch
          checked={ErrorState.PreventModals}
          onChange={(newValue) => (ErrorState.PreventModals = newValue)}
          text="Prevent error modals"
          tooltip={<>If this is set, no error modals will be shown until the game is reloaded.</>}
        />
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
            <tr key={i}>
              <td className={classes.cellText}>
                <div className={classes.xsmall}>{e.occurrences}</div>
              </td>
              <td className={classes.cellText}>
                <div className={classes.xsmall}>{e.errorType}</div>
              </td>
              <td>
                <div className={classes.errorText} key={i}>{e.message.replaceAll("/", "/​")}</div>
              </td>
              <td className={classes.cellText}>
                <div className={classes.small}>{e.scriptName.replaceAll("/", "/​")}</div>
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
    maxWidth: "200px"
  },
}));