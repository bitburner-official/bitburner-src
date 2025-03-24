import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { DWPasswordPromptModal } from "./DWPasswordPromptModal";
import { getIcon } from "../controllers/ServerIcon";
import {
  DW_SERVER_GAP_TOP,
  DW_SERVER_GAP_LEFT,
  DW_SERVER_HEIGHT,
  DW_SERVER_WIDTH,
  dwebStyles,
  MAP_BORDER_WIDTH,
} from "./dwebStyles";
import { Server } from "../../Server/Server";

export type DWServerProps = {
  server: Server;
  enableAuth: boolean;
};

export const getPixelPosition = (top: number, left: number) => ({
  top: (DW_SERVER_GAP_TOP + DW_SERVER_HEIGHT) * top + MAP_BORDER_WIDTH,
  left: (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * left + MAP_BORDER_WIDTH,
});

export function DWServerComponent({ server, enableAuth }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { classes } = dwebStyles({});
  const color = server.hasAdminRights ? classes.success : classes.rep;
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Dark web server missing dark web data");
  }

  const authButtonHandler = () => {
    setOpen(true);
  };

  const getServerPositionStyles = (i: number, j: number) => {
    const position = getPixelPosition(i, j);
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
    };
  };

  const icon: SvgIconComponent = getIcon(darkWebData.icon);
  return (
    <Container
      sx={getServerPositionStyles(darkWebData.x, darkWebData.y)}
      className={`${color} ${classes.DWServer}`}
      disableGutters
    >
      <DWPasswordPromptModal open={open} onClose={() => setOpen(false)} server={server} />
      <Container maxWidth="lg" sx={{ mx: 1, padding: 0, margin: 0 }} disableGutters>
        <Box className={`${classes.inlineFlexBox}`}>
          {React.createElement(icon, { color: "secondary" })}
          <Typography color={server.hasAdminRights ? "primary" : "secondary"} sx={{ padding: 0 }}>
            {server.hostname}
          </Typography>
        </Box>
        <Typography color="secondary">
          x:{darkWebData.x} y:{darkWebData.y}; Cha:{server.requiredHackingSkill}
        </Typography>
        <br />
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
      </Container>
    </Container>
  );
}
