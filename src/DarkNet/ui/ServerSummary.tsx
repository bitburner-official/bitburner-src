import React from "react";
import { SvgIcon, Tooltip, Typography } from "@mui/material";
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

export function ServerSummary({
  server,
  enableAuth,
  classes,
  showDetails = false,
}: ServerSummaryProps): React.ReactElement {
  if (!server.hasAdminRights && enableAuth) {
    return <Typography>[ auth required ]</Typography>;
  }
  if (!server.hasAdminRights && !enableAuth) {
    return <Typography color="secondary">(no connection)</Typography>;
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
  const runningScriptNames = Array.from(server.runningScriptMap.keys()).map((script) => script.replace("*[]", ""));
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
    <Tooltip key="runningScript" title={<>{runningScriptsTooltip}</>}>
      <Typography color={runningScriptNames.length > 0 ? "primary" : "secondary"}>
        <SvgIcon component={Terminal} className={classes.serverStatusIcon} />
        {runningScriptNames.length}
      </Typography>
    </Tooltip>
  );

  const components = [];
  if (cacheCount) {
    components.push(
      <Tooltip key="cache" title={<>{dataCacheTooltip}</>}>
        <Typography>
          <SvgIcon component={Inventory2} className={`${classes.gold} ${classes.serverStatusIcon}`} />
          {cacheCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (hasStormSeed) {
    components.push(
      <Tooltip key="stormSeed" title={<>A mysterious executable has been found here...</>}>
        <Typography>
          <SvgIcon component={Bolt} className={`${classes.gold} ${classes.serverStatusIcon}`} />?
        </Typography>
      </Tooltip>,
    );
  }
  if (hasBackdoor) {
    components.push(
      <Tooltip key="backdoor" title={<>Backdoor installed. Warning: this increases darknet instability.</>}>
        <Typography>
          <SvgIcon component={DoorBackSharp} className={`${classes.red} ${classes.serverStatusIcon}`} />
        </Typography>
      </Tooltip>,
    );
  }
  if (server.hasStasisLink) {
    components.push(
      <Tooltip
        key="backdoor"
        title={
          <>
            Stasis link installed. This allows connecting to the server remotely, as well as ns.exec from any distance.
          </>
        }
      >
        <Typography>
          <SvgIcon component={DoorBackSharp} className={`${classes.gold} ${classes.serverStatusIcon}`} />
        </Typography>
      </Tooltip>,
    );
  }
  if (contractCount) {
    components.push(
      <Tooltip key="contract" title={<>Coding contract count: {contractCount}</>}>
        <Typography>
          <SvgIcon component={Code} className={classes.serverStatusIcon} />
          {contractCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (fileCount) {
    components.push(
      <Tooltip key="file" title={<>{textFilesTooltip}</>}>
        <Typography color={fileCount ? "primary" : "secondary"}>
          <SvgIcon component={Description} className={classes.serverStatusIcon} />
          {fileCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (server.blockedRam) {
    components.push(
      <Tooltip
        key="ramBlocked"
        title={<>Ram blocked by owner: {ramBlockedDetails}. This can be freed up using ns.dnet.memoryReallocation()</>}
      >
        <Typography color={"secondary"}>
          <SvgIcon component={LockPerson} className={classes.serverStatusIcon} />
          {ramBlocked}
        </Typography>
      </Tooltip>,
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
