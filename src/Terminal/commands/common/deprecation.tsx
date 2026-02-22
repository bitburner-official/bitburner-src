import React from "react";
import { Terminal } from "../../../Terminal";
import { Settings } from "../../../Settings/Settings";
import { Typography } from "@mui/material";
import { DocumentationLink } from "../../../ui/React/DocumentationLink";
import { getTerminalStdIO } from "../../StdIO/RedirectIO";

export function sendDeprecationNotice() {
  return Terminal.printRaw(
    <Typography sx={{ color: Settings.theme.error }}>
      Running .script files is unsupported.{" "}
      <DocumentationLink page="migrations/ns2.md" color="inherit">
        Here are instructions
      </DocumentationLink>{" "}
      to migrate your scripts to .js files instead.
    </Typography>,
    getTerminalStdIO(),
  );
}
