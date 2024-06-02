import React from "react";
import BlockIcon from "@mui/icons-material/Block";
import { styled } from "@mui/styles";
import { defaultIconStyle } from "./common";
import { Lock } from "@nsdefs";
import { DeviceTooltip } from "./DeviceTooltip";

const Template = styled(BlockIcon)(defaultIconStyle);
const Icon = <Template />;

interface ILockIconProps {
  lock: Lock;
}

export const LockIcon = ({ lock }: ILockIconProps): React.ReactElement => <DeviceTooltip device={lock} icon={Icon} />;
