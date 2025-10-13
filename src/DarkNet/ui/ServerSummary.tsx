import React from "react";
import { Container, SvgIcon, Tooltip, Typography } from "@mui/material";
import { Code, Description, Inventory2, LockPerson, Terminal, Bolt, DoorBackSharp } from "@mui/icons-material";
import { RunningScript } from "../../Script/RunningScript";
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
  const dataFileCount = Array.from(server.textFiles.keys()).filter((f) =>
    f.endsWith(DarknetConstants.DataFileSuffix),
  ).length;
  const fileCount = dataFileCount + server.messages.length;
  const contractCount = server.contracts.length;
  const runningScriptCount = server.runningScriptMap
    .values()
    .map((pidMap: Map<number, RunningScript>) => pidMap.size)
    .reduce((a, b) => a + b, 0);
  const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
  const hasBackdoor = server.backdoorInstalled && !server.hasStasisLink;
  const ramBlockedDetails = formatToMaxDigits(server.ramBlock, 2) + "GB";
  const ramBlocked = showDetails ? ramBlockedDetails : formatNumber(server.ramBlock, 0);

  const runningScriptsComponent = (
    <Tooltip key="runningScript" title={<>Running scripts on server: {runningScriptCount}</>}>
      <Typography color={runningScriptCount ? "primary" : "secondary"}>
        <SvgIcon component={Terminal} className={classes.serverStatusIcon} />
        {runningScriptCount}
      </Typography>
    </Tooltip>
  );

  const components = [];
  if (cacheCount) {
    components.push(
      <Tooltip key="cache" title={<>Reward cache count: {cacheCount}</>}>
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
      <Tooltip key="file" title={<>Data files on server: {fileCount}</>}>
        <Typography color={fileCount ? "primary" : "secondary"}>
          <SvgIcon component={Description} className={classes.serverStatusIcon} />
          {fileCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (server.ramBlock) {
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
    <Container className={`${classes.inlineFlexBox} ${classes.noPadding}`} disableGutters>
      {componentsToShow}
    </Container>
  );
}
