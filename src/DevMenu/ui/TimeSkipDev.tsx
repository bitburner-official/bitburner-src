import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Player } from "@player";
import { Engine } from "../../engine";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function TimeSkipDev(): React.ReactElement {
  function timeskip(time: number) {
    return () => {
      Player.lastUpdate -= time;
      Engine._lastUpdate -= time;
      dialogBoxCreate("Time skip effect has been applied");
    };
  }

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_TimeSkipDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Time skip</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Button onClick={timeskip(60 * 1000)}>1 minute</Button>
        <Button onClick={timeskip(60 * 60 * 1000)}>1 hour</Button>
        <Button onClick={timeskip(24 * 60 * 60 * 1000)}>1 day</Button>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
