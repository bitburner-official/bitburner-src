import React, { useState } from "react";
import { MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { GameOptionsPage } from "./GameOptionsPage";
import { FormatsNeedToChange } from "../../ui/formatNumber";

export const NumericDisplayPage = (): React.ReactElement => {
  const [locale, setLocale] = useState(Settings.Locale);

  function handleLocaleChange(event: SelectChangeEvent<string>): void {
    setLocale(event.target.value);
    Settings.Locale = event.target.value;
    FormatsNeedToChange.emit();
  }
  return (
    <GameOptionsPage title="Numeric Display">
      <OptionSwitch
        checked={Settings.useEngineeringNotation}
        onChange={(newValue) => {
          Settings.useEngineeringNotation = newValue;
          FormatsNeedToChange.emit();
        }}
        text="Use engineering notation instead of scientific notation for exponential form"
        tooltip={
          <>
            If this is set, numbers displayed in exponential form will use engineering notation instead of scientific
            notation.
          </>
        }
      />
      <OptionSwitch
        checked={Settings.disableSuffixes}
        onChange={(newValue) => {
          Settings.disableSuffixes = newValue;
          FormatsNeedToChange.emit();
        }}
        text="Use exponential form instead of suffixed form"
        tooltip={
          <>
            If this is set, suffixed form will not be used, and numbers that would have been suffixed will be displayed
            with exponential form instead.
          </>
        }
      />
      <OptionSwitch
        checked={Settings.hideThousandsSeparator}
        onChange={(newValue) => {
          Settings.hideThousandsSeparator = newValue;
          FormatsNeedToChange.emit();
        }}
        text="Hide thousands separator"
        tooltip={<>If this is set, thousands separators will not be displayed.</>}
      />
      <OptionSwitch
        checked={Settings.hideTrailingDecimalZeros}
        onChange={(newValue) => {
          Settings.hideTrailingDecimalZeros = newValue;
          FormatsNeedToChange.emit();
        }}
        text="Hide trailing fractional zeroes for decimals"
        tooltip={<>If this is set, zeroes at the end of a fractional part of a decimal will not be displayed.</>}
      />
      <OptionSwitch
        checked={Settings.UseIEC60027_2}
        onChange={(newValue) => {
          Settings.UseIEC60027_2 = newValue;
          FormatsNeedToChange.emit();
        }}
        text="Use GiB instead of GB"
        tooltip={
          <>If this is set all references to memory will use GiB instead of GB, in accordance with IEC 60027-2.</>
        }
      />
      <Select startAdornment={<Typography>Locale&nbsp;</Typography>} value={locale} onChange={handleLocaleChange}>
        <MenuItem value="en">en</MenuItem>
        <MenuItem value="bg">bg</MenuItem>
        <MenuItem value="cs">cs</MenuItem>
        <MenuItem value="da-dk">da-dk</MenuItem>
        <MenuItem value="de">de</MenuItem>
        <MenuItem value="en-au">en-au</MenuItem>
        <MenuItem value="en-gb">en-gb</MenuItem>
        <MenuItem value="es">es</MenuItem>
        <MenuItem value="fr">fr</MenuItem>
        <MenuItem value="hu">hu</MenuItem>
        <MenuItem value="it">it</MenuItem>
        <MenuItem value="lv">lv</MenuItem>
        <MenuItem value="no">no</MenuItem>
        <MenuItem value="pl">pl</MenuItem>
        <MenuItem value="ru">ru</MenuItem>
      </Select>
    </GameOptionsPage>
  );
};
