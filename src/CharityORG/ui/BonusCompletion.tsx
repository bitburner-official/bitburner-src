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
  if (props.charityORG.completionCycles <= 0) return <></>;
  const bonusMillis = props.charityORG.completionCycles;
  if (!props.charityORG.completed) {
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
  } else {
    return (
      <Box display="flex">
        <Tooltip title={<Typography>You have broken the gangs!</Typography>}>
          <Typography>Record Time Held: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
        </Tooltip>
      </Box>
    );
  }
}
