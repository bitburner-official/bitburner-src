import React from "react";
import { stealthIcon } from "../data/Icons";

import { Tooltip, Typography } from "@mui/material";

export function StealthIcon(): React.ReactElement {
  return <Tooltip title={<Typography>该行动涉及潜行</Typography>}>{stealthIcon}</Tooltip>;
}
