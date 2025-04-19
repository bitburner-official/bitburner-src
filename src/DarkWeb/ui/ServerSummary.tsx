import React from "react";
import { Container, SvgIcon, Tooltip, Typography } from "@mui/material";
import { BaseServer } from "../../Server/BaseServer";
import { dnetStyles } from "./dnetStyles";
import { Code, Description, Inventory2, LockPerson, Terminal, Bolt } from "@mui/icons-material";
import { RunningScript } from "../../Script/RunningScript";
import { formatNumber, formatRam } from "../../ui/formatNumber";
import { CompletedProgramName } from "@enums";

export type ServerSummaryProps = {
  server: BaseServer;
  enableAuth: boolean;
  showDetails?: boolean;
};

export function ServerSummary({ server, enableAuth, showDetails = false }: ServerSummaryProps): React.ReactElement {
  const { classes } = dnetStyles({});

  if (!server.hasAdminRights && enableAuth) {
    return <Typography>[ auth required ]</Typography>;
  }
  if (!server.hasAdminRights && !enableAuth) {
    return <Typography color="secondary">(no connection)</Typography>;
  }

  const cacheCount = server.caches.length;
  const fileCount = server.textFiles.size + server.messages.length;
  const contractCount = server.contracts.length;
  const runningScriptCount = server.runningScriptMap
    .values()
    .map((pidMap: Map<number, RunningScript>) => pidMap.size)
    .reduce((a, b) => a + b, 0);
  const hasStormSeed = server.programs.includes(CompletedProgramName.stormSeed);
  const ramBlockedDetails = formatRam(server.darknetData?.ramBlock ?? 0);
  const ramBlocked = showDetails ? ramBlockedDetails : formatNumber(server.darknetData?.ramBlock ?? 0, 0);

  const components = [];
  if (cacheCount) {
    components.push(
      <Tooltip key="cache" title={<>Reward cache count: {cacheCount}</>}>
        <Typography>
          <SvgIcon component={Inventory2} className={`${classes.gold} ${classes.paddingRight}`} />
          {cacheCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (hasStormSeed) {
    components.push(
      <Tooltip key="stormSeed" title={<>A mysterious executable has been found here...</>}>
        <Typography>
          <SvgIcon component={Bolt} className={`${classes.red} ${classes.paddingRight}`} />?
        </Typography>
      </Tooltip>,
    );
  }
  if (contractCount) {
    components.push(
      <Tooltip key="contract" title={<>Coding contract count: {contractCount}</>}>
        <Typography>
          <SvgIcon component={Code} className={classes.paddingRight} />
          {contractCount}
        </Typography>
      </Tooltip>,
    );
  }
  if (fileCount) {
    components.push(
      <Tooltip key="file" title={<>Data files on server: {fileCount}</>}>
        <Typography color={fileCount ? "primary" : "secondary"}>
          <SvgIcon component={Description} className={classes.paddingRight} />
          {fileCount}
        </Typography>
      </Tooltip>,
    );
  }
  components.push(
    <Tooltip key="runningScript" title={<>Running scripts on server: {runningScriptCount}</>}>
      <Typography color={runningScriptCount ? "primary" : "secondary"}>
        <SvgIcon component={Terminal} className={classes.paddingRight} />
        {runningScriptCount}
      </Typography>
    </Tooltip>,
  );
  if (server.darknetData?.ramBlock) {
    components.push(
      <Tooltip
        key="ramBlocked"
        title={
          <>Ram blocked by owner: {ramBlockedDetails}. This can be freed up using dnet.influence.memoryReallocation()</>
        }
      >
        <Typography color={"secondary"}>
          <SvgIcon component={LockPerson} className={classes.paddingRight} />
          {ramBlocked}
        </Typography>
      </Tooltip>,
    );
  }

  return (
    <Container className={`${classes.inlineFlexBox} ${classes.noPadding}`} disableGutters>
      {components}
    </Container>
  );
}
