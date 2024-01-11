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
export function EffectTerror(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if (props.charityORG.terrorDrain <= 0 && props.charityORG.terrorBooster <= 0) return <></>;
  const bonusMillisDrain = (props.charityORG.terrorDrain / CyclerPerSecond) * 1000;
  const bonusMillisBoost = (props.charityORG.terrorBooster / CyclerPerSecond) * 1000;
  if (bonusMillisDrain > 0)
    return (
      <Box display="flex">
        <Tooltip title={<Typography>A negative effect. Increases the natural resistance of terror.</Typography>}>
          <Typography>Terror Drain time: {convertTimeMsToTimeElapsedString(bonusMillisDrain)}</Typography>
        </Tooltip>
      </Box>
    );
  else
    return (
      <Box display="flex">
        <Tooltip title={<Typography>A positive effect. Decreases the natural resistance of terror.</Typography>}>
          <Typography>Terror Boost time: {convertTimeMsToTimeElapsedString(bonusMillisBoost)}</Typography>
        </Tooltip>
      </Box>
    );
}
