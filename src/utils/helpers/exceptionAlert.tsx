import React from "react";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import { parseUnknownError } from "../ErrorHelper";
import { cyrb53 } from "../HashUtils";
import { commitHash } from "./commitHash";

const errorSet = new Set<string>();

/**
 * Show the error in a popup:
 * - Indicate that this is a bug and should be reported to developers.
 * - Automatically include debug information (e.g., stack trace, commit id, user agent).
 *
 * @param error Error
 * @param showOnlyOnce Set to true if you want to show the error only once, even when it happens many times. Default: false.
 * @returns
 */
export function exceptionAlert(error: unknown, showOnlyOnce = false): void {
  console.error(error);
  const errorData = parseUnknownError(error);
  if (showOnlyOnce) {
    // Calculate the "id" of the error.
    const errorId = cyrb53(errorData.errorAsString + errorData.stack);
    // Check if we showed it
    if (errorSet.has(errorId)) {
      return;
    }
    errorSet.add(errorId);
  }

  dialogBoxCreate(
    <>
      Caught an exception: {errorData.errorAsString}
      <br />
      <br />
      {errorData.stack && (
        <Typography component="div" style={{ whiteSpace: "pre-wrap" }}>
          Stack: {errorData.stack}
        </Typography>
      )}
      {errorData.causeAsString && (
        <>
          <br />
          <Typography component="div" style={{ whiteSpace: "pre-wrap" }}>
            Error cause: {errorData.causeAsString}
            {errorData.causeStack && (
              <>
                <br />
                Cause stack: {errorData.causeStack}
              </>
            )}
          </Typography>
        </>
      )}
      <br />
      Commit: {commitHash()}
      <br />
      UserAgent: {navigator.userAgent}
      <br />
      <br />
      This is a bug. Please contact developers.
    </>,
  );
}
