import { Typography } from "@mui/material";
import React from "react";
import { TooltipContent } from "./TooltipContent";
import { ISocket } from "../../ScriptEditor/NetscriptDefinitions";
import { defaultIconStyle, getComponentColor } from "./common";
import OutboxIcon from "@mui/icons-material/Outbox";
import { styled } from "@mui/styles";
import { DeviceTooltip } from "./DeviceTooltip";
import { ComponentText } from "./ComponentText";

interface IIconProps {
  socket: ISocket;
  col: string;
}

const Icon = styled(OutboxIcon)(({ socket, col }: IIconProps) => ({
  ...defaultIconStyle,
  color: new Date().getTime() > socket.cooldownUntil ? col : "gray",
}));

interface IIsocketIconProps {
  socket: ISocket;
}

export const ISocketIcon = ({ socket }: IIsocketIconProps) => (
  <DeviceTooltip device={socket} icon={<Icon socket={socket} col={getComponentColor(socket.emitting)} />}>
    <Typography>
      dispensing:&nbsp;
      <ComponentText component={socket.emitting} />
    </Typography>
    <TooltipContent device={socket} />
  </DeviceTooltip>
);
