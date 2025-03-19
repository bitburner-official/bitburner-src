import React from "react";
import { Container, Typography } from "@mui/material";
import {
  getDefaultPasswordServer,
  getEchoVulnServer,
  getMastermindHintServer,
  getNoPasswordServer, getTimingAttackServer,
} from "../models/DarkWebServer";
import { DWServerComponent } from "./DWServerComponent";

const NET_WIDTH = 5;
const NET_HEIGHT = 5;

export function DWNetDisplay(): React.ReactElement {

  const servers = [
    getNoPasswordServer(1, 1),
    getEchoVulnServer(1, 1),
    getDefaultPasswordServer(1,1),
    getMastermindHintServer(1,1),
    getTimingAttackServer(1,1),
  ]

  return (
    <Container maxWidth="lg" sx={{ mx: 0 }}>
      <Typography variant={"h6"}>Dark Web</Typography>
      <Container maxWidth="lg" sx={{ mx: 0 }}>
        {servers.map((server, index) => ( <DWServerComponent server={server} key={index} /> ))}
      </Container>
    </Container>
  );
}