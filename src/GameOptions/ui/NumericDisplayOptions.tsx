import React, { useState } from "react";
import { MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { GameOptionsPage } from "./GameOptionsPage";
import { FormatsNeedToChange } from "../../ui/formatNumber";
import { OptionsSlider } from "./OptionsSlider";

const DEFAULT_CURRENCY_SYMBOL = "$";

export const NumericDisplayPage = (): React.ReactElement => {
  const [locale, setLocale] = useState(Settings.Locale);
  const [currencySymbol, setCurrencySymbol] = useState(Settings.CurrencySymbol);

  function handleFractionalDigitChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    Settings.fractionalDigits = newValue as number;
    FormatsNeedToChange.emit();
  }

  function handleLocaleChange(event: SelectChangeEvent): void {
    setLocale(event.target.value);
    Settings.Locale = event.target.value;
    FormatsNeedToChange.emit();
  }

  // Handler for the text field (Currency Symbol)
  function handleCurrencySymbolChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const raw = event.target.value;
    setCurrencySymbol(raw);
    Settings.CurrencySymbol = raw.trim() === "" ? DEFAULT_CURRENCY_SYMBOL : raw;
    FormatsNeedToChange.emit();
  }

  return (
    <GameOptionsPage title="数字显示">
      <OptionSwitch
        checked={Settings.useEngineeringNotation}
        onChange={(newValue) => {
          Settings.useEngineeringNotation = newValue;
          FormatsNeedToChange.emit();
        }}
        text="指数形式使用工程记数法而非科学记数法"
        tooltip={
          <>
            设置后，以指数形式显示的数字将使用工程记数法而非科学记数法。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.disableSuffixes}
        onChange={(newValue) => {
          Settings.disableSuffixes = newValue;
          FormatsNeedToChange.emit();
        }}
        text="使用指数形式而非后缀形式"
        tooltip={
          <>
            设置后，将不再使用后缀形式，原本应显示为后缀形式的数字将改用指数形式显示。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.hideThousandsSeparator}
        onChange={(newValue) => {
          Settings.hideThousandsSeparator = newValue;
          FormatsNeedToChange.emit();
        }}
        text="隐藏千位分隔符"
        tooltip={<>设置后，将不显示千位分隔符。</>}
      />
      <OptionsSlider
        label="小数位数"
        initialValue={Settings.fractionalDigits}
        callback={handleFractionalDigitChange}
        step={1}
        min={0}
        max={5}
        tooltip={<>较小数字默认显示的小数位数。默认值：3</>}
      />
      <OptionSwitch
        checked={Settings.hideTrailingDecimalZeros}
        onChange={(newValue) => {
          Settings.hideTrailingDecimalZeros = newValue;
          FormatsNeedToChange.emit();
        }}
        text="隐藏小数末尾的零"
        tooltip={<>设置后，小数部分末尾的零将不会显示。</>}
      />
      <OptionSwitch
        checked={Settings.UseIEC60027_2}
        onChange={(newValue) => {
          Settings.UseIEC60027_2 = newValue;
          FormatsNeedToChange.emit();
        }}
        text="使用 GiB 而非 GB"
        tooltip={
          <>设置后，所有内存相关数值将按照 IEC 60027-2 标准使用 GiB 而非 GB。</>
        }
      />
      <Select startAdornment={<Typography>区域设置：&nbsp;</Typography>} value={locale} onChange={handleLocaleChange}>
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
      <div style={{ marginTop: "16px" }}>
        <TextField
          InputProps={{
            startAdornment: <Typography sx={{ whiteSpace: "nowrap" }}>货币符号：&nbsp;</Typography>,
          }}
          value={currencySymbol}
          onChange={handleCurrencySymbolChange}
          placeholder={DEFAULT_CURRENCY_SYMBOL}
          style={{ marginRight: "16px" }}
        />
        <OptionSwitch
          checked={Settings.CurrencySymbolAfterValue}
          onChange={(newValue) => {
            Settings.CurrencySymbolAfterValue = newValue;
            FormatsNeedToChange.emit();
          }}
          text="将货币符号移到数值之后"
          tooltip={<>启用后，货币符号将显示在数字之后（例如：100€ 而非 €100）</>}
        />
      </div>
    </GameOptionsPage>
  );
};
