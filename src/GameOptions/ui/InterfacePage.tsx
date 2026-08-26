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
    <GameOptionsPage title="界面">
      <OptionSwitch
        checked={Settings.DisableASCIIArt}
        onChange={(newValue) => (Settings.DisableASCIIArt = newValue)}
        text="禁用 ASCII 艺术"
        tooltip={
          <>
            设置后，UI 元素的 ASCII 艺术将被禁用。此设置不影响派系描述中的 ASCII 艺术。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.DisableTextEffects}
        onChange={(newValue) => (Settings.DisableTextEffects = newValue)}
        text="禁用文字特效"
        tooltip={
          <>
            设置后，将不再显示文字特效。如果某些区域的文字难以阅读，这会有所帮助。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.DisableOverviewProgressBars}
        onChange={(newValue) => (Settings.DisableOverviewProgressBars = newValue)}
        text="禁用概览进度条"
        tooltip={<>设置后，角色概览中的进度条将被隐藏。</>}
      />
      <OptionSwitch
        checked={Settings.ShowMiddleNullTimeUnit}
        onChange={(newValue) => (Settings.ShowMiddleNullTimeUnit = newValue)}
        text="显示所有中间时间单位（即使为 0）"
        tooltip={<>示例：1 小时 13 秒 将显示为 1 小时 0 分 13 秒。</>}
      />
      <Tooltip
        title={
          <Typography>
            终端命令和日志条目将附带时间戳。参见 https://date-fns.org/docs/Getting-Started/
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
                时间戳&nbsp;格式：&nbsp;
              </Typography>
            ),
          }}
          value={timestampFormat}
          onChange={handleTimestampFormatChange}
          placeholder="yyyy-MM-dd hh:mm:ss"
        />
      </Tooltip>
      <Typography>
        时间戳示例：{timestampFormat !== "" ? formatTime(timestampFormat) : "无时间戳"}
      </Typography>
      <br />
    </GameOptionsPage>
  );
};
