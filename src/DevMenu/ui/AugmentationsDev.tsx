import { Player } from "@player";
import React, { useState } from "react";
import { Clear, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ReplyIcon from "@mui/icons-material/Reply";
import { AugmentationName } from "@enums";

export function AugmentationsDev(): React.ReactElement {
  const [augmentation, setAugmentation] = useState(AugmentationName.Targeting1);

  function setAugmentationDropdown(event: SelectChangeEvent): void {
    setAugmentation(event.target.value as AugmentationName);
  }

  function queueAug(): void {
    if (Player.hasAugmentation(augmentation)) {
      return;
    }
    Player.queueAugmentation(augmentation);
  }

  function queueAllAugs(): void {
    for (const augName of Object.values(AugmentationName)) {
      if (Player.hasAugmentation(augName)) {
        continue;
      }
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
        <Box display="flex" marginBottom="8px">
          <Tooltip title="Queue all augmentations" sx={{ marginRight: "8px" }}>
            <Button onClick={queueAllAugs}>
              <ReplyAllIcon />
            </Button>
          </Tooltip>
          <Select
            onChange={setAugmentationDropdown}
            value={augmentation}
            startAdornment={
              <Tooltip title="Queue augmentation">
                <IconButton onClick={queueAug}>
                  <ReplyIcon />
                </IconButton>
              </Tooltip>
            }
          >
            {Object.values(AugmentationName).map((aug) => (
              <MenuItem key={aug} value={aug}>
                {aug}
              </MenuItem>
            ))}
          </Select>
          <Tooltip title="Clear augmentations" sx={{ marginLeft: "8px" }}>
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
