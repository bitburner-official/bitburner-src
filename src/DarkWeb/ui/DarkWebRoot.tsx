import React from "react";
import { Container } from "@mui/material";
import { WebDisplay } from "./WebDisplay";

export function DarkWebRoot(): React.ReactElement {

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <WebDisplay />
    </Container>
  );
}