import * as React from "react";
import { CharityORG } from "../CharityORG";
import { CONSTANTS } from "../../Constants";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

interface IProps {
  charityORG: CharityORG;
}

/** React Component for displaying the bonus time remaining. */
export function BonusTime(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if ((props.charityORG.storedCycles / CyclerPerSecond) * 1000 <= 5000) return <></>;
  const bonusMillis = (props.charityORG.storedCycles / CyclerPerSecond) * 1000;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>
            You gain bonus time while offline or when the game is inactive (e.g. when the tab is throttled by the
            browser). Bonus time makes the Charity mechanic progress faster, up to 25x the normal speed.
          </Typography>
        }
      >
        <Typography>Bonus time: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
      </Tooltip>
    </Box>
  );
}
