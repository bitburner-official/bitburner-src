import React from "react";
import { Container, Typography } from "@mui/material";
import {
  ConnectedTv,
  LaptopMac,
  DesktopMac,
  Dns,
  TapAndPlay,
  PhoneIphone,
  Terminal,
  SvgIconComponent,
} from "@mui/icons-material";

const NET_WIDTH = 5;
const NET_HEIGHT = 5;

export function WebDisplay(): React.ReactElement {
  // create a 5x5 array filled with nulls
  const network: (SvgIconComponent | null)[][] = Array.from({ length: NET_HEIGHT }, () => Array.from({ length: NET_WIDTH }, () => null));

  for (let i = 0; i < NET_WIDTH * 2; i++) {
    const x = Math.floor(Math.random() * NET_WIDTH);
    const y = Math.floor(Math.random() * NET_HEIGHT);
    network[y][x] = [ConnectedTv, LaptopMac, DesktopMac, Dns, TapAndPlay, PhoneIphone, Terminal][Math.floor(Math.random() * 7)];
  }


  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <Typography variant={"h6"}>Dark Web</Typography>
      {network.map(
        (row, i) => row.map(
          (cell , j) => cell && React.createElement(cell, { key: `cell_${i}_${j}`, color: "secondary" })
        ))}
    </Container>
  );
}