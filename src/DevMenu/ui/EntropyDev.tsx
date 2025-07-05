import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import { Player } from "@player";
import { Adjuster } from "./Adjuster";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function EntropyDev(): React.ReactElement {
  return (
    <AutoExpandAccordion cacheKey="DEVMENU_EntropyDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Entropy</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Adjuster
          label="Set entropy"
          placeholder="entropy"
          add={(num) => {
            Player.entropy += num;
            Player.applyEntropy(Player.entropy);
          }}
          subtract={(num) => {
            Player.entropy -= num;
            Player.applyEntropy(Player.entropy);
          }}
          tons={() => {
            Player.entropy += 1e12;
            Player.applyEntropy(Player.entropy);
          }}
          reset={() => {
            Player.entropy = 0;
            Player.applyEntropy(Player.entropy);
          }}
        />
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
