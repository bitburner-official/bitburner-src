import React, { useState } from "react";
import { Box, MenuItem, Select, SelectChangeEvent, TextField, Tooltip, Typography } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { StockChartTypeSetting } from "../../Settings/SettingEnums";
import { clearStockPriceHistories } from "../../StockMarket/PriceHistory";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { GameOptionsPage } from "./GameOptionsPage";
import { OptionsSlider } from "./OptionsSlider";
import { formatTime } from "../../utils/helpers/formatTime";

export const InterfacePage = (): React.ReactElement => {
  const [timestampFormat, setTimestampFormat] = useState(Settings.TimestampsFormat);
  const [stockChartType, setStockChartType] = useState(Settings.StockChartType);
  const [stockHistoryDisabled, setStockHistoryDisabled] = useState(Settings.DisableStockPriceHistory);

  function handleTimestampFormatChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setTimestampFormat(event.target.value);
    Settings.TimestampsFormat = event.target.value;
  }

  function handleStockChartTypeChange(event: SelectChangeEvent): void {
    const chartType = event.target.value as StockChartTypeSetting;
    setStockChartType(chartType);
    Settings.StockChartType = chartType;
  }

  function handleStockHistoryDisabledChange(newValue: boolean): void {
    setStockHistoryDisabled(newValue);
    Settings.DisableStockPriceHistory = newValue;
    // Disabling is a promise that nothing is retained, not just that nothing new is recorded.
    if (newValue) clearStockPriceHistories();
  }
  return (
    <GameOptionsPage title="Interface">
      <OptionSwitch
        checked={Settings.DisableASCIIArt}
        onChange={(newValue) => (Settings.DisableASCIIArt = newValue)}
        text="Disable ASCII art"
        tooltip={
          <>
            If this is set, ASCII art for UI elements will be disabled. This setting does not affect ASCII art in the
            description of factions.
          </>
        }
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
        tooltip={<>If this is set, progress bars in the character overview will be hidden.</>}
      />
      <OptionSwitch
        checked={Settings.ShowMiddleNullTimeUnit}
        onChange={(newValue) => (Settings.ShowMiddleNullTimeUnit = newValue)}
        text="Show all intermediary time units, even when null."
        tooltip={<>Example: 1 hour 13 seconds becomes 1 hour 0 minutes 13 seconds.</>}
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
      <Typography variant="h6">Stock Market price charts</Typography>
      <OptionSwitch
        checked={stockHistoryDisabled}
        onChange={handleStockHistoryDisabledChange}
        text="Disable price history"
        tooltip={<>If this is set, price history charts are disabled and the current price history is erased.</>}
      />
      {!stockHistoryDisabled && (
        <Box sx={{ pl: 2 }}>
          <Select
            startAdornment={<Typography>Chart&nbsp;type:&nbsp;</Typography>}
            value={stockChartType}
            onChange={handleStockChartTypeChange}
            sx={{ my: 1 }}
          >
            <MenuItem value={StockChartTypeSetting.Line}>Line</MenuItem>
            <MenuItem value={StockChartTypeSetting.Candlestick}>Candlestick</MenuItem>
          </Select>
          <OptionsSlider
            label="Price history duration (minutes)"
            initialValue={Settings.StockChartHistoryMinutes}
            callback={(_event, newValue) => (Settings.StockChartHistoryMinutes = newValue as number)}
            step={1}
            min={1}
            max={60}
            tooltip={<>How much price history the charts keep, per stock. Default: 15</>}
          />
          {stockChartType === StockChartTypeSetting.Candlestick && (
            <OptionsSlider
              label="Market ticks per candle"
              initialValue={Settings.StockChartTicksPerCandle}
              callback={(_event, newValue) => (Settings.StockChartTicksPerCandle = newValue as number)}
              step={1}
              min={2}
              max={15}
              tooltip={<>How many market updates each candlestick aggregates. Default: 5</>}
            />
          )}
          <OptionSwitch
            checked={Settings.ShowStockChartInCollapsedRows}
            onChange={(newValue) => (Settings.ShowStockChartInCollapsedRows = newValue)}
            text="Show a small price chart in collapsed ticker rows"
            tooltip={
              <>If this is set, a small recent-trend chart is shown in collapsed rows on the Stock Market page.</>
            }
          />
        </Box>
      )}
    </GameOptionsPage>
  );
};
