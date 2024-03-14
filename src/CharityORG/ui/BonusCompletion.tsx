import * as React from "react";
import { CharityORG } from "../CharityORG";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

interface IProps {
  charityORG: CharityORG;
}

/** React Component for displaying the bonus time remaining. */
export function BonusCompletion(props: IProps): React.ReactElement {
  const bonusMillis = props.charityORG.completionCycles * 200;
  if (!props.charityORG.completed && bonusMillis > 0) {
    return (
      <Box display="flex">
        <Tooltip
          title={
            <Typography>
              You have max out Visibility and minimized Terror! Keep this up for a bit longer to unlock your final
              reward.
            </Typography>
          }
        >
          <Typography>Total Time Held: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
        </Tooltip>
      </Box>
    );
  } else if (props.charityORG.completed) {
    return (
      <Box display="flex">
        <Tooltip title={<Typography>You have broken the gangs!</Typography>}>
          <Typography>Time Held: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
        </Tooltip>
      </Box>
    );
  } else return <></>;
}
