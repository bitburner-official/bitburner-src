import React, { useState } from "react";
import { Box, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { parseCommand } from "../../Terminal/Parser";
import { resolveScriptFilePath } from "../../Paths/ScriptFilePath";
import { GetServer } from "../../Server/AllServers";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import { Player } from "@player";

interface IProps {
  tooltip: React.ReactElement;
  label: string;
}

export const AutoexecInput = (props: IProps): React.ReactElement => {
  const [autoexec, setAutoexec] = useState(Settings.AutoexecScript);

  function handleAutoexecChange(event: React.ChangeEvent<HTMLInputElement>): void {
    Settings.AutoexecScript = event.target.value;
    setAutoexec(event.target.value);
  }

  // None of these errors block the saving of the setting; what is invalid now
  // could become valid later.
  function createTooltip() {
    const args = parseCommand(autoexec);
    if (args.length === 0) {
      return (
        <Tooltip title={<Typography>No script will be auto-launched</Typography>}>
          <CheckCircleIcon color="primary" />
        </Tooltip>
      );
    }
    const cmd = String(args[0]);
    const scriptPath = resolveScriptFilePath(cmd);
    if (!scriptPath) {
      return (
        <Tooltip title={<Typography>{cmd} does not end in .js or .script!</Typography>}>
          <ErrorIcon color="error" />
        </Tooltip>
      );
    }
    const home = GetServer("home");
    if (!home) {
      return (
        <Tooltip title={<Typography>Internal error: Can't find home!</Typography>}>
          <ErrorIcon color="error" />
        </Tooltip>
      );
    }
    const script = home.scripts.get(scriptPath);
    if (!script) {
      return (
        <Tooltip title={<Typography>{cmd} does not exist!</Typography>}>
          <ErrorIcon color="error" />
        </Tooltip>
      );
    }
    const ramUsage = script.getRamUsage(home.scripts);
    if (ramUsage === null) {
      return (
        <Tooltip title={<Typography>{cmd} has errors!</Typography>}>
          <ErrorIcon color="error" />
        </Tooltip>
      );
    }
    // Stolen from Prestige.ts
    const minRam = Player.sourceFileLvl(9) >= 2 ? 128 : Player.sourceFileLvl(1) > 0 ? 32 : 8;
    if (ramUsage <= minRam) {
      return (
        <Tooltip
          title={
            <Typography>
              {cmd} costs {ramUsage}GB
            </Typography>
          }
        >
          <CheckCircleIcon color="primary" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          title={
            <Typography>
              {cmd} costs {ramUsage}GB, you might only have {minRam}GB on home!
            </Typography>
          }
        >
          <WarningIcon color="warning" />
        </Tooltip>
      );
    }
  }

  return (
    <Box>
      <Tooltip title={<Typography>{props.tooltip}</Typography>}>
        <Typography>{props.label}</Typography>
      </Tooltip>
      <TextField
        fullWidth
        InputProps={{
          endAdornment: <InputAdornment position="end">{createTooltip()}</InputAdornment>,
        }}
        value={autoexec}
        onChange={handleAutoexecChange}
      />
    </Box>
  );
};
