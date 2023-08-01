import React from "react";
import { CONSTANTS } from "../../Constants";
import { Worm } from "../Worm";
import { Box, Tooltip, Typography } from "@mui/material";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";

interface IProps {
	worm: Worm;
}

export function BonusTime(props: IProps): React.ReactElement {
  const CyclesPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if ((props.worm.storedCycles / CyclesPerSecond) * 1000 <= 5000) return <></>;
  const bonusMillis = (props.worm.storedCycles / CyclesPerSecond) * 1000;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>
            You gain bonus time while offline or when the game is inactive (e.g. when the tab is throttled by the
            browser). Bonus time makes the Gang mechanic progress faster, up to 25x the normal speed.
          </Typography>
        }
      >
        <Typography>Bonus time: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
      </Tooltip>
    </Box>
  );
}
