import type { LevelableAction } from "../Types";

import React from "react";
import { Box, Switch, Tooltip, Typography } from "@mui/material";

interface AutoLevelProps {
  action: LevelableAction;
  rerender: () => void;
}

export function Autolevel({ action, rerender }: AutoLevelProps): React.ReactElement {
  function onAutolevel(event: React.ChangeEvent<HTMLInputElement>): void {
    action.autoLevel = event.target.checked;
    rerender();
  }
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <Tooltip title={<Typography>Automatically increase operation level when possible</Typography>}>
        <Typography> Autolevel:</Typography>
      </Tooltip>
      <Switch checked={action.autoLevel} onChange={onAutolevel} />
    </Box>
  );
}
