import React, {useState} from "react";
import { Container, Typography, Button } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { DarkWebServer } from "../models/DarkWebServer";
import { DWPasswordPromptModal } from "./DWPasswordPromptModal";
import { getIcon } from "../controllers/ServerIcon";

export type DWServerProps = {
  server: DarkWebServer
}

export function DWServerComponent({server}: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  const icon: SvgIconComponent = getIcon(server.icon);
  return (
    <Container sx={{ mx: 1, width: "140px"}} >
      <DWPasswordPromptModal open={open} onClose={() => setOpen(false)} server={server} />
      <Container maxWidth="lg" sx={{ mx: 1 }} disableGutters>
        {React.createElement(icon, { color: "secondary" })}
        <Typography variant={"h6"} color={server.unlocked ? "primary" : "secondary"}>{server.name} ({server.difficulty})</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Authenticate</Button>
      </Container>
    </Container>
  );
}