/**
 * Root React Component for the "Active Scripts" UI page. This page displays
 * and provides information about all of the player's scripts that are currently running
 */
import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { ActiveScriptsPage } from "./ActiveScriptsPage";
import { RecentScriptsPage } from "./RecentScriptsPage";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { useRerender } from "../React/hooks";

interface IProps {
  workerScripts: Map<number, WorkerScript>;
}

export function ActiveScriptsRoot(props: IProps): React.ReactElement {
  const [tab, setTab] = useState<"active" | "recent">("active");
  useRerender(200);

  function handleChange(event: React.SyntheticEvent, tab: "active" | "recent"): void {
    setTab(tab);
  }
  return (
    <>
      <Tabs variant="fullWidth" value={tab} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "25%" }}>
        <Tab label={"Active"} value={"active"} />
        <Tab label={"Recently Killed"} value={"recent"} />
      </Tabs>

      {tab === "active" && <ActiveScriptsPage workerScripts={props.workerScripts} />}
      {tab === "recent" && <RecentScriptsPage />}
    </>
  );
}
