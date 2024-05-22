import React from "react";
import { stealthIcon } from "../data/Icons";

import { Tooltip, Typography } from "@mui/material";

export function StealthIcon(): React.ReactElement {
  return <Tooltip title={<Typography>This action involves stealth</Typography>}>{stealthIcon}</Tooltip>;
}
