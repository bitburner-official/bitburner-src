import React, {useState} from "react";
import { Container, Typography, Button } from "@mui/material";
import {
  ConnectedTv,
  LaptopMac,
  DesktopMac,
  Dns,
  TapAndPlay,
  PhoneIphone,
  Terminal,
  SatelliteAlt,
  SvgIconComponent,
} from "@mui/icons-material";
import { DarkWebServer } from "../models/DarkWebServer";
import { DWPasswordPromptModal } from "./DWPasswordPromptModal";

export const getIcon = (name: string): SvgIconComponent => {
  switch (name) {
    case "ConnectedTv":
      return ConnectedTv;
    case "LaptopMac":
      return LaptopMac;
    case "DesktopMac":
      return DesktopMac;
    case "Dns":
      return Dns;
    case "TapAndPlay":
      return TapAndPlay;
    case "PhoneIphone":
      return PhoneIphone;
    case "Terminal":
      return Terminal;
    case "SatelliteAlt":
      return SatelliteAlt;
    default:
      return ConnectedTv;
  }
}

export type DWServerProps = {
  server: DarkWebServer
}

export function DWServerComponent({server}: DWServerProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  const icon: SvgIconComponent = getIcon(server.icon);
  return (
    <>
      <DWPasswordPromptModal open={open} onClose={() => setOpen(false)} server={server} />
      <Container maxWidth="lg" sx={{ mx: 0 }}>
        {React.createElement(icon, { color: "secondary" })}
        <Typography variant={"h6"} color={server.unlocked ? "primary" : "secondary"}>{server.name}</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Connect</Button>
      </Container>
    </>
  );
}