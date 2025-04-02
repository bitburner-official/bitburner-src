import React, { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { PasswordPromptModal } from "./PasswordPromptModal";
import { getIcon, Icon } from "../controllers/ServerIcon";
import { dnetStyles } from "./dnetStyles";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { BaseServer } from "../../Server/BaseServer";
import { DarknetState } from "../models/DarknetState";
import { getPixelPosition } from "./networkCanvas";

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
    <Container sx={getServerPositionStyles(server)} className={`${color} ${classes.DWServer}`} disableGutters>
      <PasswordPromptModal open={open} onClose={handleClose} server={server} />
      <Container maxWidth="lg" sx={{ mx: 1, padding: 0, margin: 0 }} disableGutters>
        <Box className={`${classes.inlineFlexBox}`}>
          {React.createElement(icon, { color: "secondary" })}
          <Typography color={server.hasAdminRights ? "primary" : "secondary"} className={classes.ServerName}>
            {server.hostname}
          </Typography>
        </Box>
        <Typography color="secondary">
          x:{server.darknetData?.x ?? ""} y:{server.darknetData?.y ?? ""}; Cha:{server.requiredHackingSkill}
        </Typography>
        <br />
        {server.hostname == SpecialServers.DarkWeb ? (
          ""
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={authButtonHandler}
            sx={{ marginLeft: "23px" }}
            disabled={!enableAuth}
            className={classes.authButton}
          >
            Authenticate
          </Button>
        )}
      </Container>
    </Container>
  );
}
