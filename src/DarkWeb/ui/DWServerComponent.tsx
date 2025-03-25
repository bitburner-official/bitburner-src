import React, { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { DWPasswordPromptModal } from "./DWPasswordPromptModal";
import { getIcon, Icon } from "../controllers/ServerIcon";
import {
  DW_SERVER_GAP_LEFT,
  DW_SERVER_GAP_TOP,
  DW_SERVER_HEIGHT,
  DW_SERVER_WIDTH,
  dwebStyles,
  MAP_BORDER_WIDTH,
} from "./dwebStyles";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { BaseServer } from "../../Server/BaseServer";
import { NET_WIDTH } from "../models/DarkWebState";

export type DWServerProps = {
  server: BaseServer;
  enableAuth: boolean;
};

export const getPixelPosition = (server: BaseServer, centered = false) => {

  const centeredOffsetHorizontal = centered ? DW_SERVER_WIDTH / 2 : 0;
  const centeredOffsetVertical = centered ? DW_SERVER_HEIGHT / 2 : 0;

  if (server.hostname === SpecialServers.DarkWeb){
    return {
      top: MAP_BORDER_WIDTH * 0.2 + (centered ? centeredOffsetVertical : 0),
      left: (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * NET_WIDTH * 0.5 + (centered ? centeredOffsetHorizontal : 0),
    }
  }

  const coords = getCoordinates(server);

  const widthOfServers = (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * coords.y;
  const staggeredHorizontalOffset = coords.x % 2 ? DW_SERVER_WIDTH / 2 : 0;
  const heightOfServers = (DW_SERVER_GAP_TOP + DW_SERVER_HEIGHT) * coords.x;

  return {
    top: heightOfServers + MAP_BORDER_WIDTH + centeredOffsetVertical,
    left: widthOfServers + MAP_BORDER_WIDTH + centeredOffsetHorizontal + staggeredHorizontalOffset,
  }
};

const getCoordinates = (server: BaseServer) => {
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Server missing dark web data");
  }
  return {
    x: darkWebData.x,
    y: darkWebData.y,
  }
}

export function DWServerComponent({ server, enableAuth }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { classes } = dwebStyles({});
  const color = server.hasAdminRights ? classes.success : classes.rep;
  const icon = getIcon(server.darkWebData?.icon ?? Icon.Terminal);

  const authButtonHandler = () => {
    setOpen(true);
  };

  const getServerPositionStyles = (server: BaseServer) => {
    const position = getPixelPosition(server);
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
    };
  };

  return (
    <Container
      sx={getServerPositionStyles(server)}
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
          x:{server.darkWebData?.x ?? ""} y:{server.darkWebData?.y ?? ""}; Cha:{server.requiredHackingSkill}
        </Typography>
        <br />
        {server.hostname == SpecialServers.DarkWeb ? "" :  <Button
          variant="contained"
          color="primary"
          onClick={authButtonHandler}
          sx={{ marginLeft: "23px" }}
          disabled={!enableAuth}
          className={classes.authButton}
        >
          Authenticate
        </Button>}
      </Container>
    </Container>
  );
}
