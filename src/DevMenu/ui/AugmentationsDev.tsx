import { Player } from "@player";
import React from "react";
import { ExpandMore } from "@mui/icons-material";
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
import { applyAugmentation } from "../../Augmentation/AugmentationHelpers";

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
    Player.reapplyAllAugmentations();
    Player.reapplyAllSourceFiles();
  }

  function clearQueuedAugs(): void {
    Player.queuedAugmentations = [];
  }

  function installAugs(): void {
    for (const aug of Player.queuedAugmentations) {
      applyAugmentation(aug);
    }
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
        <Typography>强化</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" marginBottom="8px">
          <Tooltip title="将所有强化加入队列" style={{ marginRight: "8px" }}>
            <Button onClick={queueAllAugs}>
              <ReplyAllIcon />
            </Button>
          </Tooltip>
          <Tooltip title="将强化加入队列">
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
        </Box>
        <Button onClick={installAugs} style={{ marginRight: "8px" }}>
          {`快速安装 ${Player.queuedAugmentations.length} 个排队中的强化`}
        </Button>
        <Button onClick={clearQueuedAugs} style={{ marginRight: "8px" }}>
          {`清空 ${Player.queuedAugmentations.length} 个排队中的强化`}
        </Button>
        <Button onClick={clearAugs}>{`卸载 ${Player.augmentations.length} 个已安装的强化`}</Button>
        <Box display="flex" marginTop="8px">
          <Tooltip title="将所选派系提供的全部强化加入队列（NFG 除外）">
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
