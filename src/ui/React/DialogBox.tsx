import { AlertEvents } from "./AlertManager";

import React from "react";
import { Typography } from "@mui/material";

export function dialogBoxCreate(
  txt: string | JSX.Element,
  { html, canBeDismissedEasily } = { html: false, canBeDismissedEasily: true },
): void {
  AlertEvents.emit(
    typeof txt !== "string" ? (
      txt
    ) : html ? (
      <div dangerouslySetInnerHTML={{ __html: txt }}></div>
    ) : (
      <Typography component="span" style={{ whiteSpace: "pre-wrap" }}>
        {txt}
      </Typography>
    ),
    canBeDismissedEasily,
  );
}
