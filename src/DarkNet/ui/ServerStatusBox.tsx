import React, { useState } from "react";
import { Box, Button, Container, Typography, SvgIcon } from "@mui/material";
import { ServerDetailsModal } from "./ServerDetailsModal";
import { getIcon, Icon } from "./ServerIcon";
import { BaseServer } from "../../Server/BaseServer";
import { DarknetState } from "../models/DarknetState";
import { getPixelPosition } from "./networkCanvas";
import { ServerSummary } from "./ServerSummary";
import { getDarknetData } from "../effects/effects";

export type DWServerProps = {
  server: BaseServer;
  enableAuth: boolean;
  classes: {
    [key: string]: string;
  };
};

export function ServerStatusBox({ server, enableAuth, classes }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const darknetData = getDarknetData(server);
  const color = darknetData?.hasStasisLink ? classes.goldBorder : server.hasAdminRights ? classes.green : classes.grey;
  const icon = getIcon(darknetData?.icon ?? Icon.Terminal);

  const authButtonHandler = () => {
    DarknetState.openServer = server;
    setOpen(true);
  };

  const handleClose = () => {
    DarknetState.openServer = null;
    setOpen(false);
  };

  const getServerPositionStyles = (server: BaseServer) => {
    const position = getPixelPosition(server);
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
    };
  };

  return (
    <>
      {open ? <ServerDetailsModal open={open} onClose={handleClose} server={server} classes={classes} /> : ""}
      <Button
        sx={getServerPositionStyles(server)}
        className={`${color} ${classes.DWServer}`}
        onClick={authButtonHandler}
        disabled={!enableAuth}
      >
        <Container maxWidth="lg" className={classes.serverContainer} disableGutters>
          <Box className={classes.inlineFlexBox}>
            <SvgIcon component={icon} color="secondary" />
            <Typography color={server.hasAdminRights ? "primary" : "secondary"} className={classes.ServerName}>
              {server.hostname}
            </Typography>
          </Box>
          <Typography color="secondary" className={classes.ip}>
            {server.ip} cha:{darknetData?.requiredCharismaSkill ?? 0}
          </Typography>
          <br />
          <ServerSummary server={server} enableAuth={enableAuth} classes={classes} />
        </Container>
      </Button>
    </>
  );
}
