import React from "react";
import { Tooltip, Container, Typography, SvgIcon } from "@mui/material";
import { BaseServer } from "../../Server/BaseServer";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { dnetStyles } from "./dnetStyles";
import { Code, Description, Inventory2, Terminal } from "@mui/icons-material";
import { RunningScript } from "../../Script/RunningScript";

export type ServerSummaryProps = {
  server: BaseServer;
  enableAuth: boolean;
};

export function ServerSummary({ server, enableAuth }: ServerSummaryProps): React.ReactElement {
  const { classes } = dnetStyles({});

  if (server.hostname === SpecialServers.DarkWeb) {
    return <></>;
  }
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

  return (
    <Container className={classes.inlineFlexBox}>
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
        <Typography>
          <SvgIcon component={Description} className={classes.paddingRight} />
          {fileCount}
        </Typography>
      </Tooltip>
      <Tooltip title={<>Running scripts on server: {runningScriptCount}</>}>
        <Typography>
          <SvgIcon component={Terminal} className={classes.paddingRight} />
          {runningScriptCount}
        </Typography>
      </Tooltip>
    </Container>
  );
}
