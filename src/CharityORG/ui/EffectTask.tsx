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
export function EffectTask(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if (props.charityORG.fastTasks <= 0 && props.charityORG.slowTasks <= 0) return <></>;
  const bonusMillisDrain = (props.charityORG.slowTasks / CyclerPerSecond) * 1000;
  const bonusMillisBoost = (props.charityORG.fastTasks / CyclerPerSecond) * 1000;
  if (bonusMillisDrain > 0)
    return (
      <Box display="flex">
        <Tooltip
          title={
            <Typography>
              A negative effect. Decreases the natural progression of all tasks, both current and attacks.
            </Typography>
          }
        >
          <Typography>Task Drain time: {convertTimeMsToTimeElapsedString(bonusMillisDrain)}</Typography>
        </Tooltip>
      </Box>
    );
  else
    return (
      <Box display="flex">
        <Tooltip
          title={
            <Typography>A positive effect. Increases the natural of all tasks, both current and attacks.</Typography>
          }
        >
          <Typography>Task Boost time: {convertTimeMsToTimeElapsedString(bonusMillisBoost)}</Typography>
        </Tooltip>
      </Box>
    );
}
