import * as React from "react";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useRerender } from "../../ui/React/hooks";
import { formatNumber } from "../../ui/formatNumber";
import { Player } from "@player";

/** React Component for displaying the bonus time remaining. */
export function KarmaAvailable(): React.ReactElement {
  useRerender(200);
  return (
    <Box display="flex">
      <Tooltip title={<Typography variant="body1">The current amount of Karma that you have.</Typography>}>
        <Typography>Karma Available: {formatNumber(Player.karma)}</Typography>
      </Tooltip>
    </Box>
  );
}
