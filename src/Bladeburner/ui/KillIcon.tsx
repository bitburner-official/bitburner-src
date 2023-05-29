import React from "react";

import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { killIcon } from "../data/Icons";

export function KillIcon(): React.ReactElement {
  return <Tooltip title={<Typography>This action involves retirement</Typography>}>{killIcon}</Tooltip>;
}
