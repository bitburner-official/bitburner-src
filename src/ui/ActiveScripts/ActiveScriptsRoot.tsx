/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useState } from "react";
import { Button, Tabs, Tab } from "@mui/material";

import { ActiveScriptsPage } from "./ActiveScriptsPage";
import { RecentScriptsPage } from "./RecentScriptsPage";
import { RecentErrorsPage } from "../../ErrorHandling/RecentErrorsPage";
import { useRerender } from "../React/hooks";
import { ErrorState, killAllScripts } from "../../ErrorHandling/ErrorState";
import { SimplePage } from "@enums";
import { Router } from "../GameRoot";

type ActiveScriptsTab = SimplePage.ActiveScripts | SimplePage.RecentlyKilledScripts | SimplePage.RecentErrors;

export type ComponentProps = {
  page: ActiveScriptsTab;
};

export function ActiveScriptsRoot({ page }: ComponentProps): React.ReactElement {
  const [tab, setTab] = useState<ActiveScriptsTab>(ErrorState.UnreadErrors > 0 ? SimplePage.RecentErrors : page);
  useRerender(400);

  function handleChange(
    event: React.SyntheticEvent,
    tab: SimplePage.ActiveScripts | SimplePage.RecentlyKilledScripts | SimplePage.RecentErrors,
  ): void {
    setTab(tab);
    Router.toPage(tab);
  }

  function errorTabText(): string {
    if (!ErrorState.UnreadErrors || tab === SimplePage.RecentErrors) {
      return "Recent Errors";
    }
    return `Recent Errors (${ErrorState.UnreadErrors})`;
  }

  return (
    <>
      <div style={{ display: "inline-flex" }}>
        <Tabs
          variant="fullWidth"
          value={page}
          onChange={handleChange}
          sx={{ minWidth: "fit-content", maxWidth: "25%" }}
        >
          <Tab label={"Active"} value={SimplePage.ActiveScripts} />
          <Tab label={"Recently Killed"} value={SimplePage.RecentlyKilledScripts} />
          <Tab label={errorTabText()} value={SimplePage.RecentErrors} />
        </Tabs>
        <Button color="error" onClick={killAllScripts} style={{ marginLeft: "200px", border: "1px solid" }}>
          Kill All Scripts
        </Button>
      </div>

      {tab === SimplePage.ActiveScripts && <ActiveScriptsPage />}
      {tab === SimplePage.RecentlyKilledScripts && <RecentScriptsPage />}
      {tab === SimplePage.RecentErrors && <RecentErrorsPage />}
    </>
  );
}
