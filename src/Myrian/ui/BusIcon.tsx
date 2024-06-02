import React from "react";
import { defaultIconStyle } from "./common";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { styled } from "@mui/styles";
import { Bus } from "@nsdefs";
import { TooltipContent } from "./TooltipContent";
import { DeviceTooltip } from "./DeviceTooltip";
import { TooltipEnergy } from "./TooltipEnergy";
import { Typography } from "@mui/material";

const Template = styled(DirectionsBusIcon)(defaultIconStyle);
const Icon = <Template />;

interface IBusIconProps {
  bus: Bus;
}

export const BusIcon = ({ bus }: IBusIconProps): React.ReactElement => (
  <DeviceTooltip device={bus} icon={Icon}>
    <Typography>moveLvl: {bus.moveLvl}</Typography>
    <Typography>transferLvl: {bus.transferLvl}</Typography>
    <Typography>reduceLvl: {bus.reduceLvl}</Typography>
    <Typography>installLvl: {bus.installLvl}</Typography>
    <TooltipEnergy device={bus} />
    <TooltipContent device={bus} />
  </DeviceTooltip>
);
