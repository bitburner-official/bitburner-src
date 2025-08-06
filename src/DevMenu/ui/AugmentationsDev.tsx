import { Player } from "@player";
import React from "react";
import { Clear, ExpandMore } from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ReplyIcon from "@mui/icons-material/Reply";
import { AugmentationName, FactionName } from "@enums";
import { Factions } from "../../Faction/Factions";
import { FactionChooser } from "./FactionChooser";
import { getFactionAugmentationsFiltered } from "../../Faction/FactionHelpers";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function AugmentationsDev(): React.ReactElement {
  const [augmentation, setAugmentation] = React.useState<AugmentationName | null>(null);
  const [selectedFaction, setSelectedFaction] = React.useState(Factions[FactionName.Illuminati]);

  function queueAug(): void {
    if (!augmentation) {
      return;
    }
    // NFG can be queued again to increase its level.
    if (Player.hasAugmentation(augmentation) && augmentation !== AugmentationName.NeuroFluxGovernor) {
      return;
    }
    Player.queueAugmentation(augmentation);
    setAugmentation(null);
  }

  function queueAllAugs(): void {
    for (const augName of Object.values(AugmentationName)) {
      if (Player.hasAugmentation(augName)) {
        continue;
      }
      Player.queueAugmentation(augName);
    }
    setAugmentation(null);
  }

  function queueAllAugsOfFaction(): void {
    for (const augName of getFactionAugmentationsFiltered(selectedFaction)) {
      /**
       * Skip NFG. This tool is usually used when testing the situation in which the player installs all augmentations
       * from a specific faction. If we use this tool n times, we also get n levels of NFG, which may not be what we
       * want to test.
       */
      if (Player.hasAugmentation(augName) || augName === AugmentationName.NeuroFluxGovernor) {
        continue;
      }
      Player.queueAugmentation(augName);
    }
    setAugmentation(null);
  }

  function clearAugs(): void {
    Player.augmentations = [];
  }

  function clearQueuedAugs(): void {
    Player.queuedAugmentations = [];
  }

  const options = Object.values(AugmentationName).filter(
    (augmentationName) =>
      // NFG is always eligible.
      !Player.hasAugmentation(augmentationName) || augmentationName === AugmentationName.NeuroFluxGovernor,
  );

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_AugmentationsDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Augmentations</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" marginBottom="8px">
          <Tooltip title="Queue all augmentations" style={{ marginRight: "8px" }}>
            <Button onClick={queueAllAugs}>
              <ReplyAllIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Queue augmentation">
            <IconButton onClick={queueAug}>
              <ReplyIcon />
            </IconButton>
          </Tooltip>
          <Autocomplete
            style={{ width: "500px" }}
            options={options}
            value={augmentation}
            renderInput={(params) => <TextField {...params} style={{ height: "100%" }} />}
            onChange={(_, augmentationName) => {
              setAugmentation(augmentationName);
            }}
          ></Autocomplete>
          <Tooltip title="Clear augmentations" style={{ marginLeft: "8px" }}>
            <Button onClick={clearAugs}>
              <Clear />
            </Button>
          </Tooltip>
        </Box>
        <Button onClick={clearQueuedAugs}>Clear queued augmentations</Button>
        <Box display="flex" marginTop="8px">
          <Tooltip title="Queue all augmentations offered by faction, except NFG">
            <Button onClick={queueAllAugsOfFaction}>
              <ReplyAllIcon />
            </Button>
          </Tooltip>
          <FactionChooser faction={selectedFaction} onChange={setSelectedFaction} style={{ marginLeft: "16px" }} />
        </Box>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
