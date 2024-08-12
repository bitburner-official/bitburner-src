import { Player } from "@player";
import React from "react";
import { Clear, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
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
import { AugmentationName } from "@enums";

export function AugmentationsDev(): React.ReactElement {
  const [augmentation, setAugmentation] = React.useState<AugmentationName | null>(null);

  function queueAug(): void {
    if (!augmentation) {
      return;
    }
    if (Player.hasAugmentation(augmentation)) {
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

  function clearAugs(): void {
    Player.augmentations = [];
  }

  function clearQueuedAugs(): void {
    Player.queuedAugmentations = [];
  }

  const options = Object.values(AugmentationName).filter(
    (augmentationName) => !Player.hasAugmentation(augmentationName),
  );

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
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
            style={{ width: "400px" }}
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
      </AccordionDetails>
    </Accordion>
  );
}
