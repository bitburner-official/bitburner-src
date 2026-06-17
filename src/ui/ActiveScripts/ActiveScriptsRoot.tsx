/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useEffect, useState } from "react";
import { Button, Tab, Tabs } from "@mui/material";

import { ActiveScriptsPage } from "./ActiveScriptsPage";
import { RecentScriptsPage } from "./RecentScriptsPage";
import { RecentErrorsPage } from "../../ErrorHandling/RecentErrorsPage";
import { useRerender } from "../React/hooks";
import { errorModalsAreSuppressed, ErrorState, toggleSuppressErrorModals } from "../../ErrorHandling/ErrorState";
import { OptionSwitch } from "../React/OptionSwitch";
import { killAllScripts } from "../../Netscript/killWorkerScript";
import { ComplexPage, SimplePage } from "@enums";
import { Router } from "../GameRoot";
import { Settings } from "../../Settings/Settings";

type ActiveScriptsTab = ComplexPage.ActiveScripts | SimplePage.RecentlyKilledScripts | SimplePage.RecentErrors;

export type ComponentProps = {
  page: ActiveScriptsTab;
  serverName?: string;
};

export function ActiveScriptsRoot({ page, serverName }: ComponentProps): React.ReactElement {
  const [tab, setTab] = useState<ActiveScriptsTab>(page);
  useRerender(400);

  useEffect(() => {
    if (ErrorState.UnreadErrors > 0) {
      handleChange(null, SimplePage.RecentErrors);
    }
  }, []);

  function handleChange(
    __event: React.SyntheticEvent | null,
    tab: ComplexPage.ActiveScripts | SimplePage.RecentlyKilledScripts | SimplePage.RecentErrors,
  ): void {
    setTab(tab);
    if (tab === ComplexPage.ActiveScripts) {
      Router.toPage(tab, {});
    } else {
      Router.toPage(tab);
    }
  }

  function errorTabText(): string {
    if (!ErrorState.UnreadErrors || tab === SimplePage.RecentErrors) {
      return "Recent Errors";
    }
    return `Recent Errors (${ErrorState.UnreadErrors})`;
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          sx={{
            minHeight: "fit-content",
            "& .MuiButtonBase-root.MuiTab-root": {
              margin: 0,
              padding: "10px",
              whiteSpace: "pre",
              minHeight: "40px",
            },
          }}
        >
          <Tab label={"Active"} value={ComplexPage.ActiveScripts} />
          <Tab label={"Recently Killed"} value={SimplePage.RecentlyKilledScripts} />
          <Tab label={errorTabText()} value={SimplePage.RecentErrors} />
        </Tabs>
        {Settings.SuppressErrorModals ? (
          <div style={{ width: "15%" }}></div>
        ) : (
          <OptionSwitch
            checked={errorModalsAreSuppressed()}
            onChange={(newValue) => toggleSuppressErrorModals(newValue)}
            text="Suppress error modals (5 min)"
            tooltip={
              <>
                If this is set, no error modals will be shown for the next five minutes, and only log errors to the
                Recent Errors page.
              </>
            }
            wrapperStyles={{ marginLeft: "20px" }}
          />
        )}
        <Button color="error" onClick={killAllScripts} sx={{ margin: 0 }}>
          Kill All Scripts
        </Button>
      </div>

      {tab === ComplexPage.ActiveScripts && <ActiveScriptsPage serverName={serverName} />}
      {tab === SimplePage.RecentlyKilledScripts && <RecentScriptsPage />}
      {tab === SimplePage.RecentErrors && <RecentErrorsPage />}
    </>
  );
}
