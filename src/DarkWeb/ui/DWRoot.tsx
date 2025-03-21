import React from "react";
import { Container } from "@mui/material";
import { DWNetDisplay } from "./DWNetDisplay";

export function DWRoot(): React.ReactElement {
  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <DWNetDisplay />
    </Container>
  );
}
