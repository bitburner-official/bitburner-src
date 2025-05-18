import React from "react";
import { Container, SvgIcon, Tooltip, Typography } from "@mui/material";
import { BaseServer } from "../../Server/BaseServer";
import { Code, Description, Inventory2, LockPerson, Terminal, Bolt, DoorBackSharp } from "@mui/icons-material";
import { RunningScript } from "../../Script/RunningScript";
import { formatNumber } from "../../ui/formatNumber";
import { CompletedProgramName } from "@enums";
import { formatToMaxDigits } from "./uiUtilities";
import { getDarknetData } from "../effects/effects";

export type ServerSummaryProps = {
  server: BaseServer;
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

  const darknetData = getDarknetData(server);
  const cacheCount = server.caches.length;
  const fileCount = server.textFiles.size + server.messages.length;
  const contractCount = server.contracts.length;
  const runningScriptCount = server.runningScriptMap
    .values()
    .map((pidMap: Map<number, RunningScript>) => pidMap.size)
    .reduce((a, b) => a + b, 0);
  const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
  const hasBackdoor = server.backdoorInstalled && !darknetData?.hasStasisLink;
  const ramBlockedDetails = formatToMaxDigits(darknetData?.ramBlock ?? 0, 2) + "GB";
  const ramBlocked = showDetails ? ramBlockedDetails : formatNumber(darknetData?.ramBlock ?? 0, 0);

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
  components.push(
    <Tooltip key="runningScript" title={<>Running scripts on server: {runningScriptCount}</>}>
      <Typography color={runningScriptCount ? "primary" : "secondary"}>
        <SvgIcon component={Terminal} className={classes.serverStatusIcon} />
        {runningScriptCount}
      </Typography>
    </Tooltip>,
  );
  if (darknetData?.ramBlock) {
    components.push(
      <Tooltip
        key="ramBlocked"
        title={
          <>Ram blocked by owner: {ramBlockedDetails}. This can be freed up using dnet.influence.memoryReallocation()</>
        }
      >
        <Typography color={"secondary"}>
          <SvgIcon component={LockPerson} className={classes.serverStatusIcon} />
          {ramBlocked}
        </Typography>
      </Tooltip>,
    );
  }
  const componentsToShow = showDetails ? components : components.slice(0, 3);

  return (
    <Container className={`${classes.inlineFlexBox} ${classes.noPadding}`} disableGutters>
      {componentsToShow}
    </Container>
  );
}
