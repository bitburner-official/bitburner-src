import React from "react";
import { Tooltip, Typography } from "@mui/material";
import { killIcon } from "../data/Icons";

export function KillIcon(): React.ReactElement {
  return <Tooltip title={<Typography>该行动涉及清除</Typography>}>{killIcon}</Tooltip>;
}
