import React, { ReactNode } from "react";
import { Device } from "../../ScriptEditor/NetscriptDefinitions";
import { Tooltip, Typography } from "@mui/material";

interface INewTooltipProps {
  icon: React.JSX.Element;
  device: Device;
  children?: ReactNode;
}

export const DeviceTooltip = ({ device, icon, children }: INewTooltipProps): React.ReactElement => (
  <Tooltip
    title={
      <>
        <Typography>
          {device.name} ({device.type})
        </Typography>
        {children}
      </>
    }
  >
    {icon}
  </Tooltip>
);
