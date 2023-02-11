import React, { useState } from "react";
import { TextField, Tooltip, Typography } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { GameOptionsPage } from "./GameOptionsPage";
import { formatTime } from "../../utils/helpers/formatTime";

export const InterfacePage = (): React.ReactElement => {
  const [timestampFormat, setTimestampFormat] = useState(Settings.TimestampsFormat);

  function handleTimestampFormatChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setTimestampFormat(event.target.value);
    Settings.TimestampsFormat = event.target.value;
  }
  return (
    <GameOptionsPage title="Interface">
      <OptionSwitch
        checked={Settings.DisableASCIIArt}
        onChange={(newValue) => (Settings.DisableASCIIArt = newValue)}
        text="Disable ascii art"
        tooltip={<>If this is set all ASCII art will be disabled.</>}
      />
      <OptionSwitch
        checked={Settings.DisableTextEffects}
        onChange={(newValue) => (Settings.DisableTextEffects = newValue)}
        text="Disable text effects"
        tooltip={
          <>
            If this is set, text effects will not be displayed. This can help if text is difficult to read in certain
            areas.
          </>
        }
      />
      <OptionSwitch
        checked={Settings.DisableOverviewProgressBars}
        onChange={(newValue) => (Settings.DisableOverviewProgressBars = newValue)}
        text="Disable Overview Progress Bars"
        tooltip={<>If this is set, the progress bars in the character overview will be hidden.</>}
      />
      <OptionSwitch
        checked={Settings.ShowMiddleNullTimeUnit}
        onChange={(newValue) => (Settings.ShowMiddleNullTimeUnit = newValue)}
        text="Show all intermediary times unit, even when null."
        tooltip={<>ex : 1 hours 13 seconds becomes 1 hours 0 minutes 13 seconds.</>}
      />
      <Tooltip
        title={
          <Typography>
            Terminal commands and log entries will be timestamped. See https://date-fns.org/docs/Getting-Started/
          </Typography>
        }
      >
        <TextField
          key={"timestampFormat"}
          InputProps={{
            startAdornment: (
              <Typography
                color={formatTime(timestampFormat) === "format error" && timestampFormat !== "" ? "error" : "success"}
              >
                Timestamp&nbsp;format:&nbsp;
              </Typography>
            ),
          }}
          value={timestampFormat}
          onChange={handleTimestampFormatChange}
          placeholder="yyyy-MM-dd hh:mm:ss"
        />
      </Tooltip>
      <Typography>
        Example timestamp: {timestampFormat !== "" ? formatTime(timestampFormat) : "no timestamp"}
      </Typography>
      <br />
    </GameOptionsPage>
  );
};
