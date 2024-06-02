import React from "react";
import { ContainerDevice } from "@nsdefs";
import { Typography } from "@mui/material";
import { ComponentText } from "./ComponentText";

export const TooltipContent = ({ device }: { device: ContainerDevice }): React.ReactElement => (
  <>
    {device.content.length !== 0 && (
      <Typography>
        content ({device.content.length} / {device.maxContent}):
        <br />
        {device.content.map((component, i) => (
          <ComponentText key={i} component={component} />
        ))}
      </Typography>
    )}
  </>
);
