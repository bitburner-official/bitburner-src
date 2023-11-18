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
export function BonusVisibility(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if (props.charityORG.visibilityBooster <= 0) return <></>;
  const bonusMillis = (props.charityORG.visibilityBooster / CyclerPerSecond) * 1000;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>
            A bonus to assist you with visibility gains. Reduces the natural drag of having higher visibility.
          </Typography>
        }
      >
        <Typography>Bonus visibility time: {convertTimeMsToTimeElapsedString(bonusMillis)}</Typography>
      </Tooltip>
    </Box>
  );
}
