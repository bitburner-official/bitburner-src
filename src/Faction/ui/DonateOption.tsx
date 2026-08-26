import React, { useState } from "react";

import { Faction } from "../Faction";
import { Player } from "@player";
import { canDonate, donate, repFromDonation } from "../formulas/donation";
import { Favor } from "../../ui/React/Favor";

import { Money } from "../../ui/React/Money";
import { Reputation } from "../../ui/React/Reputation";

import { dialogBoxCreate } from "../../ui/React/DialogBox";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { NumberInput } from "../../ui/React/NumberInput";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

type DonateOptionProps = {
  faction: Faction;
  disabled: boolean;
  favorToDonate: number;
  rerender: () => void;
};

/** React component for a donate option on the Faction UI */
export function DonateOption({ faction, favorToDonate, disabled, rerender }: DonateOptionProps): React.ReactElement {
  const [donateAmt, setDonateAmt] = useState<number>(NaN);

  function onDonate(): void {
    const repGain = donate(donateAmt, faction);
    if (repGain > 0) {
      dialogBoxCreate(
        <>
          你刚刚向 {faction.name} 捐赠了 <Money money={donateAmt} />
          ，获得了 <Reputation reputation={repGain} /> 声望。
        </>,
      );
      rerender();
    }
  }

  function Status(): React.ReactElement {
    if (isNaN(donateAmt)) return <></>;
    if (!canDonate(donateAmt)) {
      if (Player.money < donateAmt) return <Typography>资金不足</Typography>;
      return <Typography>输入的捐赠金额无效！</Typography>;
    }
    return (
      <Typography>
        这次捐赠将使你获得 <Reputation reputation={repFromDonation(donateAmt, Player)} /> 声望
      </Typography>
    );
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Status />
      {disabled ? (
        <Typography>
          与 {faction.name} 的人脉达到 <Favor favor={favorToDonate} /> 后解锁捐赠
        </Typography>
      ) : (
        <>
          <NumberInput
            onChange={setDonateAmt}
            placeholder={"捐赠金额"}
            disabled={disabled}
            InputProps={{
              endAdornment: (
                <Button onClick={onDonate} disabled={disabled || !canDonate(donateAmt)}>
                  捐赠
                </Button>
              ),
            }}
          />
          <MathNotationOutput notation={MathNotation.RepDonation} />
        </>
      )}
    </Paper>
  );
}
