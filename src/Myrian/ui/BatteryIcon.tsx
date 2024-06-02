import React from "react";
import { Battery } from "@nsdefs";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import { defaultIconStyle } from "./common";
import { styled } from "@mui/styles";
import { DeviceTooltip } from "./DeviceTooltip";
import { TooltipTier } from "./TooltipTier";
import { TooltipEnergy } from "./TooltipEnergy";

const Template = styled(BatteryChargingFullIcon)(defaultIconStyle);
const Icon = <Template />;

interface IBatteryIconProps {
  battery: Battery;
}

export const BatteryIcon = ({ battery }: IBatteryIconProps): React.ReactElement => (
  <DeviceTooltip device={battery} icon={Icon}>
    <TooltipTier device={battery} />
    <TooltipEnergy device={battery} />
  </DeviceTooltip>
);
