import React from "react";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import { getErrorMetadata } from "../ErrorHelper";
import { cyrb53 } from "../StringHelperFunctions";

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
  const errorAsString = String(error);
  const errorStackTrace = error instanceof Error ? error.stack : undefined;
  if (showOnlyOnce) {
    // Calculate the "id" of the error.
    const errorId = cyrb53(errorAsString + errorStackTrace);
    // Check if we showed it
    if (errorSet.has(errorId)) {
      return;
    } else {
      errorSet.add(errorId);
    }
  }
  const errorMetadata = getErrorMetadata(error);

  dialogBoxCreate(
    <>
      Caught an exception: {errorAsString}
      <br />
      <br />
      {errorStackTrace && (
        <Typography component="div" style={{ whiteSpace: "pre-wrap" }}>
          Stack: {errorStackTrace}
        </Typography>
      )}
      Commit: {errorMetadata.version.commitHash}
      <br />
      UserAgent: {navigator.userAgent}
      <br />
      <br />
      This is a bug. Please contact developers.
    </>,
  );
}
