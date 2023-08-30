import React, { useState } from "react";

import { CONSTANTS } from "../../Constants";
import { Faction } from "../Faction";
import { Player } from "@player";
import { canDonate, donate, repFromDonation } from "../formulas/donation";
import { Favor } from "../../ui/React/Favor";

import { Money } from "../../ui/React/Money";
import { Reputation } from "../../ui/React/Reputation";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { MathJax } from "better-react-mathjax";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { NumberInput } from "../../ui/React/NumberInput";

type DonateOptionProps = {
  faction: Faction;
  disabled: boolean;
  favorToDonate: number;
  rerender: () => void;
};

/** React component for a donate option on the Faction UI */
export function DonateOption({ faction, favorToDonate, disabled, rerender }: DonateOptionProps): React.ReactElement {
  const [donateAmt, setDonateAmt] = useState<number>(NaN);
  const digits = (CONSTANTS.DonateMoneyToRepDivisor + "").length - 1;

  function onDonate(): void {
    const repGain = donate(donateAmt, faction);
    if (repGain > 0) {
      dialogBoxCreate(
        <>
          You just donated <Money money={donateAmt} /> to {faction.name} to gain <Reputation reputation={repGain} />{" "}
          reputation.
        </>,
      );
      rerender();
    }
  }

  function Status(): React.ReactElement {
    if (isNaN(donateAmt)) return <></>;
    if (!canDonate(donateAmt)) {
      if (Player.money < donateAmt) return <Typography>Insufficient funds</Typography>;
      return <Typography>Invalid donate amount entered!</Typography>;
    }
    return (
      <Typography>
        This donation will result in <Reputation reputation={repFromDonation(donateAmt, Player)} /> reputation gain
      </Typography>
    );
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Status />
      {disabled ? (
        <Typography>
          Unlock donations at <Favor favor={favorToDonate} /> favor with {faction.name}
        </Typography>
      ) : (
        <>
          <NumberInput
            onChange={setDonateAmt}
            placeholder={"Donation amount"}
            disabled={disabled}
            InputProps={{
              endAdornment: (
                <Button onClick={onDonate} disabled={disabled || !canDonate(donateAmt)}>
                  donate
                </Button>
              ),
            }}
          />
          <Typography>
            <MathJax>{`\\(reputation = \\frac{\\text{donation amount} \\cdot \\text{reputation multiplier}}{10^{${digits}}}\\)`}</MathJax>
          </Typography>
        </>
      )}
    </Paper>
  );
}
