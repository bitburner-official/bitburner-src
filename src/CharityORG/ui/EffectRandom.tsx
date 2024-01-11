import * as React from "react";
import { CharityORG } from "../CharityORG";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { formatNumber } from "../../ui/formatNumber";

interface IProps {
  charityORG: CharityORG;
}

/** React Component for displaying the bonus time remaining. */
export function EffectRandom(props: IProps): React.ReactElement {
  if (props.charityORG.random < 1) return <></>;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>A neutral effect. When expended will create an extra randomized (and lucky) event.</Typography>
        }
      >
        <Typography>Ramdom events left: {formatNumber(props.charityORG.random, 0)}</Typography>
      </Tooltip>
    </Box>
  );
}
