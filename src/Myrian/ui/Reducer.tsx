import React from "react";
import { TooltipContent } from "./TooltipContent";
import { Reducer } from "@nsdefs";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import { styled } from "@mui/styles";
import { defaultIconStyle } from "./common";
import { DeviceTooltip } from "./DeviceTooltip";
import { TooltipTier } from "./TooltipTier";

const Template = styled(MergeTypeIcon)(defaultIconStyle);
const Icon = <Template />;

interface IReducerIconProps {
  reducer: Reducer;
}

export const ReducerIcon = ({ reducer }: IReducerIconProps): React.ReactElement => (
  <DeviceTooltip device={reducer} icon={Icon}>
    <TooltipTier device={reducer} />
    <TooltipContent device={reducer} />
  </DeviceTooltip>
);
