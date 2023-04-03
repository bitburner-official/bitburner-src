import React, { useState } from "react";

import { Box, Typography, Button, Container } from "@mui/material";

import { Player } from "@player";

import { SleeveElem } from "./SleeveElem";
import { FAQModal } from "./FAQModal";
import { useRerender } from "../../../ui/React/hooks";

export function SleeveRoot(): React.ReactElement {
  const [FAQOpen, setFAQOpen] = useState(false);
  const rerender = useRerender(200);

  return (
    <>
      <Container disableGutters maxWidth="md" sx={{ mx: 0 }}>
        <Typography variant="h4">Sleeves</Typography>
        <Typography>
          Duplicate Sleeves are MK-V Synthoids (synthetic androids) into which your consciousness has been copied. In
          other words, these Synthoids contain a perfect duplicate of your mind.
          <br />
          <br />
          Sleeves can be used to perform different tasks simultaneously.
          <br />
          <br />
        </Typography>
      </Container>

      <Button onClick={() => setFAQOpen(true)}>FAQ</Button>
      <Button
        href="https://bitburner-official.readthedocs.io/en/latest/advancedgameplay/sleeves.html#duplicate-sleeves"
        target="_blank"
      >
        Wiki Documentation
      </Button>
      <Box display="grid" sx={{ gridTemplateColumns: "repeat(2, 1fr)", mt: 1 }}>
        {Player.sleeves.map((sleeve, i) => (
          <SleeveElem key={i} rerender={rerender} sleeve={sleeve} />
        ))}
      </Box>
      <FAQModal open={FAQOpen} onClose={() => setFAQOpen(false)} />
    </>
  );
}
