import React from "react";
import { Tooltip, Container, Typography, SvgIcon } from "@mui/material";
import { BaseServer } from "../../Server/BaseServer";
import { dnetStyles } from "./dnetStyles";
import { Code, LockPerson, Description, Inventory2, Terminal } from "@mui/icons-material";
import { RunningScript } from "../../Script/RunningScript";
import { formatNumber, formatRam } from "../../ui/formatNumber";

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
  const ramBlockedDetails = formatRam(server.darknetData?.ramBlock ?? 0);
  const ramBlocked = showDetails ? ramBlockedDetails : formatNumber(server.darknetData?.ramBlock ?? 0, 0);

  return (
    <Container className={`${classes.inlineFlexBox} ${classes.noPadding}`} disableGutters>
      {cacheCount ? (
        <Tooltip title={<>Reward cache count: {cacheCount}</>}>
          <Typography>
            <SvgIcon component={Inventory2} className={`${classes.gold} ${classes.paddingRight}`} />
            {cacheCount}
          </Typography>
        </Tooltip>
      ) : (
        ""
      )}
      {contractCount ? (
        <Tooltip title={<>Coding contract count: {contractCount}</>}>
          <Typography>
            <SvgIcon component={Code} className={classes.paddingRight} />
            {contractCount}
          </Typography>
        </Tooltip>
      ) : (
        ""
      )}
      <Tooltip title={<>Data files on server: {fileCount}</>}>
        <Typography color={fileCount ? "primary" : "secondary"}>
          <SvgIcon component={Description} className={classes.paddingRight} />
          {fileCount}
        </Typography>
      </Tooltip>
      <Tooltip title={<>Running scripts on server: {runningScriptCount}</>}>
        <Typography color={runningScriptCount ? "primary" : "secondary"}>
          <SvgIcon component={Terminal} className={classes.paddingRight} />
          {runningScriptCount}
        </Typography>
      </Tooltip>
      {server.darknetData?.ramBlock ? (
        <Tooltip
          title={
            <>
              Ram blocked by owner: {ramBlockedDetails}. This can be freed up using dnet.influence.memoryReallocation()
            </>
          }
        >
          <Typography color={"secondary"}>
            <SvgIcon component={LockPerson} className={classes.paddingRight} />
            {ramBlocked}
          </Typography>
        </Tooltip>
      ) : (
        ""
      )}
    </Container>
  );
}
