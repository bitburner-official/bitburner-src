import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { Settings } from "../Settings/Settings";
import { formatMoney } from "../ui/formatNumber";

export interface BetInputProps {
  initialBet: number;
  maxBet: number;
  gameInProgress: boolean;
  setBet: (bet: number) => void;
  validBetCallback?: () => void;
  invalidBetCallback?: () => void;
}

export function BetInput({
  initialBet,
  maxBet,
  gameInProgress,
  setBet,
  validBetCallback,
  invalidBetCallback,
}: BetInputProps): React.ReactElement {
  const [betValue, setBetValue] = useState<string>(initialBet.toString());
  const [helperText, setHelperText] = useState<string>("");
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const betInput = event.target.value;
    setBetValue(betInput);
    const bet = Math.round(parseFloat(betInput));
    let isValid = false;
    /**
     * We intentionally do not check if the player has enough money. The player's money can change between these checks
     * and when the bet is actually used.
     */
    if (isNaN(bet)) {
      setBet(0);
      setHelperText("Not a valid number");
    } else if (bet <= 0) {
      setBet(0);
      setHelperText("Must bet a positive amount");
    } else if (bet > maxBet) {
      // This is for the player's convenience. They can type a bunch of 9s, and we will set the max bet for them.
      setBetValue(String(maxBet));
      setBet(maxBet);
    } else {
      // Valid wager
      isValid = true;
      setBet(bet);
      setHelperText("");
    }
    if (isValid) {
      if (validBetCallback) {
        validBetCallback();
      }
    } else {
      if (invalidBetCallback) {
        invalidBetCallback();
      }
    }
  };
  return (
    <TextField
      sx={{
        marginTop: "20px",
        marginBottom: "20px",
        width: "200px",
        "& .MuiInputLabel-root.Mui-disabled": {
          WebkitTextFillColor: Settings.theme.disabled,
        },
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: Settings.theme.disabled,
        },
      }}
      value={betValue}
      label={<>Wager (Max: {formatMoney(maxBet)})</>}
      disabled={gameInProgress}
      onChange={onChange}
      error={helperText !== ""}
      helperText={helperText}
      type="number"
      InputProps={{
        // Without startAdornment, label and placeholder are only shown when TextField is focused
        startAdornment: <></>,
      }}
    />
  );
}
