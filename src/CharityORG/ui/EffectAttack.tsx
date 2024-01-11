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
export function EffectAttack(props: IProps): React.ReactElement {
  const CyclerPerSecond = 1000 / CONSTANTS.MilliPerCycle;
  if (props.charityORG.fastAttacks <= 0 && props.charityORG.stopAttacks <= 0) return <></>;
  const bonusMillisDrain = (props.charityORG.stopAttacks / CyclerPerSecond) * 1000;
  const bonusMillisBoost = (props.charityORG.fastAttacks / CyclerPerSecond) * 1000;
  if (bonusMillisDrain > 0)
    return (
      <Box display="flex">
        <Tooltip
          title={
            <Typography>
              A positive effect. Completely stops the natural progression and accumulation of new attacks. Does not stop
              Random attacks.
            </Typography>
          }
        >
          <Typography>Stop Attack time: {convertTimeMsToTimeElapsedString(bonusMillisDrain)}</Typography>
        </Tooltip>
      </Box>
    );
  else
    return (
      <Box display="flex">
        <Tooltip title={<Typography>A negative effect. Increases the speed by which attacks occure.</Typography>}>
          <Typography>Attack Boost time: {convertTimeMsToTimeElapsedString(bonusMillisBoost)}</Typography>
        </Tooltip>
      </Box>
    );
}
