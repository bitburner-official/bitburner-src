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
export function BonusTerror(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if (props.charityORG.terrorBooster <= 0) return <></>;
  const bonusMillis = (props.charityORG.terrorBooster / CyclerPerSecond) * 1000;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>A bonus to assist you with terror reduction. Reduces the natural increase of terror.</Typography>
        }
      >
        <Typography>Bonus terror time: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
      </Tooltip>
    </Box>
  );
}
