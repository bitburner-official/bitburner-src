import React, { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { DarkWebServer } from "../models/DarkWebServer";
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

export type DWServerProps = {
  server: DarkWebServer;
};

export const getPixelPosition = (top: number, left: number) => ({
  top: (DW_SERVER_GAP_TOP + DW_SERVER_HEIGHT) * top + MAP_BORDER_WIDTH,
  left: (DW_SERVER_GAP_LEFT + DW_SERVER_WIDTH) * left + MAP_BORDER_WIDTH,
});

export function DWServerComponent({ server }: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { classes } = dwebStyles({});
  const color = server.unlocked ? classes.success : classes.rep;

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

  const icon: SvgIconComponent = getIcon(server.icon);
  return (
    <Container
      sx={getServerPositionStyles(server.x, server.y)}
      className={`${color} ${classes.DWServer}`}
      disableGutters
    >
      <DWPasswordPromptModal open={open} onClose={() => setOpen(false)} server={server} />
      <Container maxWidth="lg" sx={{ mx: 1, padding: 0, margin: 0 }} disableGutters>
        <Box className={`${classes.inlineFlexBox}`}>
          {React.createElement(icon, { color: "secondary" })}
          <Typography color={server.unlocked ? "primary" : "secondary"} sx={{ padding: 0 }}>
            {server.name}
          </Typography>
        </Box>
        {/*<Typography color="secondary">Cha required: {server.chaRequired}</Typography>*/}
        <Typography color="secondary">
          Coords: {server.x}, {server.y}
        </Typography>
        <br />
        <Button variant="contained" color="primary" onClick={authButtonHandler} sx={{ marginLeft: "23px" }}>
          Authenticate
        </Button>
      </Container>
    </Container>
  );
}
