/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { ActiveScriptsPage } from "./ActiveScriptsPage";
import { RecentScriptsPage } from "./RecentScriptsPage";
import { RecentErrorsPage } from "../../ErrorHandling/RecentErrorsPage";
import { useRerender } from "../React/hooks";
import { ErrorState } from "../../ErrorHandling/ErrorState";

export function ActiveScriptsRoot(): React.ReactElement {
  const [tab, setTab] = useState<"active" | "recent" | "errors">(ErrorState.UnreadErrors > 0 ? "errors" : "active");
  useRerender(400);

  function handleChange(event: React.SyntheticEvent, tab: "active" | "recent" | "errors"): void {
    setTab(tab);
  }
  return (
    <>
      <Tabs variant="fullWidth" value={tab} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "25%" }}>
        <Tab label={"Active"} value={"active"} />
        <Tab label={"Recently Killed"} value={"recent"} />
        <Tab label={`Recent Errors (${ErrorState.UnreadErrors})`} value={"errors"} />
      </Tabs>

      {tab === "active" && <ActiveScriptsPage />}
      {tab === "recent" && <RecentScriptsPage />}
      {tab === "errors" && <RecentErrorsPage />}
    </>
  );
}
