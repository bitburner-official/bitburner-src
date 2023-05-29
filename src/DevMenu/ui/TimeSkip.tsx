import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { saveObject } from "../../SaveObject";
import { Engine } from "../../engine";

// Update as additional BitNodes get implemented

export function TimeSkip(): React.ReactElement {
  function timeskip(time: number) {
    return () => {
      Player.lastUpdate -= time;
      Engine._lastUpdate -= time;
      saveObject.saveGame();
      setTimeout(() => location.reload(), 1000);
    };
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Time skip</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Button onClick={timeskip(60 * 1000)}>1 minute</Button>
        <Button onClick={timeskip(60 * 60 * 1000)}>1 hour</Button>
        <Button onClick={timeskip(24 * 60 * 60 * 1000)}>1 day</Button>
      </AccordionDetails>
    </Accordion>
  );
}
