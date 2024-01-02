import React from "react";
import { Terminal } from "../../../Terminal";
import { Settings } from "../../../Settings/Settings";
import { Link, Typography } from "@mui/material";
import { Router } from "../../../ui/GameRoot";
import { Page } from "../../../ui/Router";

export function sendDeprecationNotice() {
  return Terminal.printRaw(
    <Typography sx={{ color: Settings.theme.warning }}>
      NOTICE: NS1 (.script) scripts are deprecated and will be removed in a future update.{" "}
      <Link
        style={{ cursor: "pointer" }}
        color="inherit"
        onClick={() => Router.toPage(Page.Documentation, { docPage: "migrations/ns2.md" })}
      >
        Here are instructions
      </Link>{" "}
      to migrate to NS2 (.js) scripts.
    </Typography>,
  );
}
