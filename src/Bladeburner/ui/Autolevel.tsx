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
      <Tooltip title={<Typography>尽可能自动提升行动等级</Typography>}>
        <Typography> 自动升级：</Typography>
      </Tooltip>
      <Switch checked={action.autoLevel} onChange={onAutolevel} />
    </Box>
  );
}
