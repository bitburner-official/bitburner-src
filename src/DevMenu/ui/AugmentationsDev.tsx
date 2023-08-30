import { Player } from "@player";
import React, { useState } from "react";
import { Clear, ExpandMore, Reply, ReplyAll } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { AugmentationName } from "@enums";

export function AugmentationsDev(): React.ReactElement {
  const [augmentation, setAugmentation] = useState(AugmentationName.Targeting1);

  function setAugmentationDropdown(event: SelectChangeEvent): void {
    setAugmentation(event.target.value as AugmentationName);
  }
  function queueAug(): void {
    Player.queueAugmentation(augmentation);
  }

  function queueAllAugs(): void {
    for (const augName of Object.values(AugmentationName)) {
      Player.queueAugmentation(augName);
    }
  }

  function clearAugs(): void {
    Player.augmentations = [];
  }

  function clearQueuedAugs(): void {
    Player.queuedAugmentations = [];
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>Augmentations</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Select
          onChange={setAugmentationDropdown}
          value={augmentation}
          startAdornment={
            <>
              <IconButton onClick={queueAllAugs} size="large">
                <ReplyAll />
              </IconButton>
              <IconButton onClick={queueAug} size="large">
                <Reply />
              </IconButton>
            </>
          }
          endAdornment={
            <>
              <IconButton onClick={clearAugs} size="large">
                <Clear />
              </IconButton>
            </>
          }
        >
          {Object.values(AugmentationName).map((aug) => (
            <MenuItem key={aug} value={aug}>
              {aug}
            </MenuItem>
          ))}
        </Select>
        <Button sx={{ display: "block" }} onClick={clearQueuedAugs}>
          Clear Queued Augmentations
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}
