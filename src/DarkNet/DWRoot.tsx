import React from "react";
import { Container } from "@mui/material";
import { NetworkDisplayWrapper } from "./ui/NetworkDisplayWrapper";

export function DWRoot(): React.ReactElement {
  return (
    <Container disableGutters maxWidth={false} sx={{ mx: 0 }}>
      <NetworkDisplayWrapper />
    </Container>
  );
}
