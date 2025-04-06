import React, { useState } from "react";
import { Box, Button, Container, Typography, SvgIcon } from "@mui/material";
import { PasswordPromptModal } from "./PasswordPromptModal";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { dnetStyles } from "./dnetStyles";
import { BaseServer } from "../../Server/BaseServer";
import { DarknetState } from "../models/DarknetState";
import { getPixelPosition } from "./networkCanvas";
import { ServerSummary } from "./ServerSummary";

export type DWServerProps = {
  server: BaseServer;
  enableAuth: boolean;
};

export function DNServerComponent({ server, enableAuth }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { classes } = dnetStyles({});
  const color = server.hasAdminRights ? classes.success : classes.rep;
  const icon = getIcon(server.darknetData?.icon ?? Icon.Terminal);

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
    {open ? <PasswordPromptModal open={open} onClose={handleClose} server={server} /> : ""}
    <Button sx={getServerPositionStyles(server)}
            className={`${color} ${classes.DWServer}`}
            onClick={authButtonHandler}
            disabled={!enableAuth}>
      <Container maxWidth="lg" className={classes.serverContainer} disableGutters>
        <Box className={classes.inlineFlexBox}>
          <SvgIcon component={icon} color="secondary" />
          <Typography color={server.hasAdminRights ? "primary" : "secondary"} className={classes.ServerName}>
            {server.hostname}
          </Typography>
        </Box>
        <Typography color="secondary">
          x:{server.darknetData?.x ?? ""} y:{server.darknetData?.y ?? ""}; Cha:{server.requiredHackingSkill}
        </Typography>
        <br />
        <ServerSummary server={server} enableAuth={enableAuth} />
      </Container>
    </Button>
    </>
  );
}
