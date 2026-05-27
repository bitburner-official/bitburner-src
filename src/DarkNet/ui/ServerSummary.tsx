import React from "react";
import { Code, Description, Inventory2, LockPerson, Terminal, Bolt, DoorBackSharp } from "@mui/icons-material";
import { formatNumber } from "../../ui/formatNumber";
import { CompletedProgramName } from "@enums";
import { formatToMaxDigits } from "./uiUtilities";

import type { DarknetServer } from "../../Server/DarknetServer";
import { DarknetConstants } from "../Constants";

export type ServerSummaryProps = {
  server: DarknetServer;
  enableAuth: boolean;
  showDetails?: boolean;
  classes: {
    [key: string]: string;
  };
};

const summaryItemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
};

export function ServerSummary({
  server,
  enableAuth,
  classes,
  showDetails = false,
}: ServerSummaryProps): React.ReactElement {
  if (!server.hasAdminRights && enableAuth) {
    return <span style={{ display: "block" }}>[ auth required ]</span>;
  }
  if (!server.hasAdminRights && !enableAuth) {
    return (
      <span className={classes.txtSecondary} style={{ display: "block" }}>
        (no connection)
      </span>
    );
  }

  const cacheCount = server.caches.length;
  const dataFiles = Array.from(server.textFiles.keys()).filter((f) => f.endsWith(DarknetConstants.DataFileSuffix));
  const textFiles = [...dataFiles, ...server.messages];
  const fileCount = textFiles.length;
  const textFilesTooltip =
    textFiles.length > 0
      ? `Data files on server: ${textFiles.slice(0, 3).join(", ")}${
          textFiles.length > 3 ? ` +${textFiles.length - 3}` : ""
        }`
      : "No data files on server";
  const contractCount = server.contracts.length;
  let runningScriptCount = 0;
  const scripts = new Map<string, number>();
  for (const map of server.runningScriptMap.values()) {
    const rs = map.values().next().value;
    if (!rs) continue;
    runningScriptCount += map.size;
    const count = (scripts.get(rs.filename) ?? 0) + map.size;
    scripts.set(rs.filename, count);
  }
  const runningScriptNames = scripts
    .entries()
    .map(([name, count]) => name + (count === 1 ? "" : "x" + count))
    .toArray();
  const runningScriptsTooltip =
    runningScriptNames.length > 0
      ? `Running scripts on server: ${runningScriptNames.slice(0, 3).join(", ")}${
          runningScriptNames.length > 3 ? ` +${runningScriptNames.length - 3}` : ""
        }`
      : "No running scripts on server";
  const dataCacheTooltip = `Reward caches on server: ${server.caches.slice(0, 3).join(", ")}${
    server.caches.length > 3 ? ` +${server.caches.length - 3}` : ""
  }`;
  const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
  const hasBackdoor = server.backdoorInstalled && !server.hasStasisLink;
  const ramBlockedDetails = formatToMaxDigits(server.blockedRam, 2) + "GB";
  const ramBlocked = showDetails ? ramBlockedDetails : formatNumber(server.blockedRam, 0);

  const runningScriptsComponent = (
    <span
      key="runningScript"
      title={runningScriptsTooltip}
      className={runningScriptCount > 0 ? classes.txtPrimary : classes.txtSecondary}
      style={summaryItemStyle}
    >
      <Terminal className={classes.serverStatusIcon} />
      {runningScriptCount}
    </span>
  );

  const components = [];
  if (cacheCount) {
    components.push(
      <span key="cache" title={dataCacheTooltip} style={summaryItemStyle}>
        <Inventory2 className={`${classes.gold} ${classes.serverStatusIcon}`} />
        {cacheCount}
      </span>,
    );
  }
  if (hasStormSeed) {
    components.push(
      <span key="stormSeed" title="A mysterious executable has been found here..." style={summaryItemStyle}>
        <Bolt className={`${classes.gold} ${classes.serverStatusIcon}`} />?
      </span>,
    );
  }
  if (hasBackdoor) {
    components.push(
      <span
        key="backdoor"
        title="Backdoor installed. Warning: this increases darknet instability."
        style={summaryItemStyle}
      >
        <DoorBackSharp className={`${classes.red} ${classes.serverStatusIcon}`} />
      </span>,
    );
  }
  if (server.hasStasisLink) {
    components.push(
      <span
        key="stasis"
        title="Stasis link installed. This allows connecting to the server remotely, as well as ns.exec from any distance."
        style={summaryItemStyle}
      >
        <DoorBackSharp className={`${classes.gold} ${classes.serverStatusIcon}`} />
      </span>,
    );
  }
  if (contractCount) {
    components.push(
      <span key="contract" title={`Coding contract count: ${contractCount}`} style={summaryItemStyle}>
        <Code className={classes.serverStatusIcon} />
        {contractCount}
      </span>,
    );
  }
  if (fileCount) {
    components.push(
      <span
        key="file"
        title={textFilesTooltip}
        className={fileCount ? classes.txtPrimary : classes.txtSecondary}
        style={summaryItemStyle}
      >
        <Description className={classes.serverStatusIcon} />
        {fileCount}
      </span>,
    );
  }
  if (server.blockedRam) {
    components.push(
      <span
        key="ramBlocked"
        title={`Ram blocked by owner: ${ramBlockedDetails}. This can be freed up using ns.dnet.memoryReallocation()`}
        className={classes.txtSecondary}
        style={summaryItemStyle}
      >
        <LockPerson className={classes.serverStatusIcon} />
        {ramBlocked}
      </span>,
    );
  }
  const maxIcons = showDetails ? components.length : 2;
  const componentsToShow = [...components.slice(0, maxIcons), runningScriptsComponent];

  return (
    <div style={{ display: "inline-flex", flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
      {componentsToShow}
    </div>
  );
}
