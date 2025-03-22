import React from "react";
import { Container } from "@mui/material";
import { DWNetDisplayWrapper } from "./DWNetDisplayWrapper";

export function DWRoot(): React.ReactElement {
  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <DWNetDisplayWrapper />
    </Container>
  );
}
