import React from "react";
import { Container } from "@mui/material";
import { NetworkDisplayWrapper } from "./NetworkDisplayWrapper";

export function DWRoot(): React.ReactElement {
  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <NetworkDisplayWrapper />
    </Container>
  );
}
