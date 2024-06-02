import React from "react";
import { EnergyDevice } from "@nsdefs";
import { Typography } from "@mui/material";

interface ITooltipEnergyProps {
  device: EnergyDevice;
}

export const TooltipEnergy = ({ device }: ITooltipEnergyProps): React.ReactElement => (
  <Typography>
    {device.energy} / {device.maxEnergy} energy
  </Typography>
);
