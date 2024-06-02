import React from "react";
import { TieredDevice } from "@nsdefs";
import { Typography } from "@mui/material";

interface ITooltipTierProps {
  device: TieredDevice;
}

export const TooltipTier = ({ device }: ITooltipTierProps): React.ReactElement => (
  <Typography>Tier: {device.tier}</Typography>
);
