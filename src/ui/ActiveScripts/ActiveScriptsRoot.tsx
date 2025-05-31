/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";

import { ActiveScriptsPage } from "./ActiveScriptsPage";
import { RecentScriptsPage } from "./RecentScriptsPage";
import { RecentErrorsPage } from "../../ErrorHandling/RecentErrorsPage";
import { useRerender } from "../React/hooks";
import { ErrorState } from "../../ErrorHandling/ErrorState";
import { OptionSwitch } from "../React/OptionSwitch";
import { killAllScripts } from "../../Netscript/killWorkerScript";

export function ActiveScriptsRoot(): React.ReactElement {
  const [tab, setTab] = useState<"active" | "recent" | "errors">(ErrorState.UnreadErrors > 0 ? "errors" : "active");
  useRerender(400);

  function handleChange(__event: React.SyntheticEvent, tab: "active" | "recent" | "errors"): void {
    setTab(tab);
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
          <Tab label={"Active"} value={"active"} />
          <Tab label={"Recently Killed"} value={"recent"} />
          <Tab label={`Recent Errors (${ErrorState.UnreadErrors})`} value={"errors"} />
        </Tabs>
        <OptionSwitch
          checked={ErrorState.PreventModals}
          onChange={(newValue) => (ErrorState.PreventModals = newValue)}
          text="Prevent error modals"
          tooltip={<>If this is set, no error modals will be shown until the game is reloaded.</>}
          wrapperStyles={{ marginLeft: "20px" }}
        />
        <Button color="error" onClick={killAllScripts} sx={{ margin: 0 }}>
          Kill All Scripts
        </Button>
      </div>

      {tab === "active" && <ActiveScriptsPage />}
      {tab === "recent" && <RecentScriptsPage />}
      {tab === "errors" && <RecentErrorsPage />}
    </>
  );
}
