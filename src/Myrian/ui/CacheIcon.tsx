import React from "react";
import { TooltipContent } from "./TooltipContent";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { styled } from "@mui/styles";
import { defaultIconStyle } from "./common";
import { Cache } from "@nsdefs";
import { DeviceTooltip } from "./DeviceTooltip";

const Template = styled(CheckBoxOutlineBlankIcon)(defaultIconStyle);
const Icon = <Template />;

interface ICacheIconProps {
  cache: Cache;
}

export const CacheIcon = ({ cache }: ICacheIconProps): React.ReactElement => (
  <DeviceTooltip device={cache} icon={Icon}>
    <TooltipContent device={cache} />
  </DeviceTooltip>
);
