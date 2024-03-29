import React from "react";
import { Tooltip, Typography } from "@mui/material";
import { killIcon } from "../data/Icons";

export function KillIcon(): React.ReactElement {
  return <Tooltip title={<Typography>This action involves retirement</Typography>}>{killIcon}</Tooltip>;
}
