import React, {useState} from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { DarkWebServer } from "../models/DarkWebServer";
import { DWPasswordPromptModal } from "./DWPasswordPromptModal";
import { getIcon } from "../controllers/ServerIcon";
import {
  DW_SERVER_GAP_X,
  DW_SERVER_GAP_Y,
  DW_SERVER_HEIGHT,
  DW_SERVER_WIDTH,
  dwebStyles,
  MAP_BORDER_WIDTH,
} from "./dwebStyles";

export type DWServerProps = {
  server: DarkWebServer,
}

export function DWServerComponent({server}: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { classes } = dwebStyles({});
  const color = server.unlocked ? classes.success : classes.rep;

  const authButtonHandler = () => {
    setOpen(true);
  }

  const getServerPositionStyles = (i: number, j: number) => ({
    left: `${(DW_SERVER_GAP_X + DW_SERVER_WIDTH) * i + MAP_BORDER_WIDTH}px`,
    top: `${(DW_SERVER_GAP_Y + DW_SERVER_HEIGHT) * j + MAP_BORDER_WIDTH}px`,
  })

  const icon: SvgIconComponent = getIcon(server.icon);
  return (
    <Container sx={getServerPositionStyles(server.x, server.y)} className={`${color} ${classes.DWServer}`} disableGutters>
      <DWPasswordPromptModal open={open} onClose={() => setOpen(false)} server={server} />
      <Container maxWidth="lg" sx={{ mx: 1, padding: 0, margin: 0 }} disableGutters>
        <Box className={`${classes.inlineFlexBox}`}>
        {React.createElement(icon, { color: "secondary" })}
        <Typography color={server.unlocked ? "primary" : "secondary"} sx={{padding:0}}>{server.name}</Typography>
        </Box>
        <Typography color="secondary">Cha required: {server.chaRequired}</Typography>
        <br/>
        <Button variant="contained" color="primary" onClick={authButtonHandler} sx={{marginLeft: "23px"}}>Authenticate</Button>
      </Container>
    </Container>
  );
}