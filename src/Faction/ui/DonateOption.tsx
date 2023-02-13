import React, { useState } from "react";

import { CONSTANTS } from "../../Constants";
import { Faction } from "../Faction";
import { Player } from "@player";
import { repFromDonation } from "../formulas/donation";
import { Favor } from "../../ui/React/Favor";

import { Money } from "../../ui/React/Money";
import { Reputation } from "../../ui/React/Reputation";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { MathJax } from "better-react-mathjax";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { NumberInput } from "../../ui/React/NumberInput";

type IProps = {
  faction: Faction;
  disabled: boolean;
  favorToDonate: number;
  rerender: () => void;
};

/** React component for a donate option on the Faction UI */
export function DonateOption(props: IProps): React.ReactElement {
  const [donateAmt, setDonateAmt] = useState<number>(NaN);
  const digits = (CONSTANTS.DonateMoneyToRepDivisor + "").length - 1;

  function canDonate(): boolean {
    if (isNaN(donateAmt)) return false;
    if (isNaN(donateAmt) || donateAmt <= 0) return false;
    if (Player.money < donateAmt) return false;
    return true;
  }

  function donate(): void {
    const fac = props.faction;
    const amt = donateAmt;
    if (isNaN(amt)) return;
    if (!canDonate()) return;
    Player.loseMoney(amt, "other");
    const repGain = repFromDonation(amt, Player);
    props.faction.playerReputation += repGain;
    dialogBoxCreate(
      <>
        You just donated <Money money={amt} /> to {fac.name} to gain <Reputation reputation={repGain} /> reputation.
      </>,
    );
    props.rerender();
  }

  function Status(): React.ReactElement {
    if (isNaN(donateAmt)) return <></>;
    if (!canDonate()) {
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
      {props.disabled ? (
        <Typography>
          Unlock donations at <Favor favor={props.favorToDonate} /> favor with {props.faction.name}
        </Typography>
      ) : (
        <>
          <NumberInput
            onChange={setDonateAmt}
            placeholder={"Donation amount"}
            disabled={props.disabled}
            InputProps={{
              endAdornment: (
                <Button onClick={donate} disabled={props.disabled || !canDonate()}>
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
