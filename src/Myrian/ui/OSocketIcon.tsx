import React from "react";
import { Typography } from "@mui/material";
import { OSocket } from "@nsdefs";
import { defaultIconStyle, getComponentColor } from "./common";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import { styled } from "@mui/styles";
import { DeviceTooltip } from "./DeviceTooltip";
import { TooltipContent } from "./TooltipContent";
import { ComponentText } from "./ComponentText";

interface IIconProps {
  col: string;
}

const Icon = styled(MoveToInboxIcon)(({ col }: IIconProps) => ({
  ...defaultIconStyle,
  color: col,
}));

interface IOSocketIconProps {
  socket: OSocket;
}

export const OSocketIcon = ({ socket }: IOSocketIconProps): React.ReactElement => (
  <DeviceTooltip device={socket} icon={<Icon col={getComponentColor(socket.currentRequest[0])} />}>
    <Typography>
      requesting:
      <br />
      {socket.currentRequest.map((c, i) => (
        <ComponentText key={i} component={c} />
      ))}
    </Typography>
    <TooltipContent device={socket} />
  </DeviceTooltip>
);
