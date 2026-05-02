/**
 * React component for a panel that lets you purchase upgrades for a Duplicate
 * Sleeve's Memory (through The Covenant)
 */
import React, { useState } from "react";

import { Sleeve } from "../Sleeve";

import { formatSleeveMemory } from "../../../ui/formatNumber";
import { Money } from "../../../ui/React/Money";

import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { canPurchaseMemoryUpgrade, purchaseSleeveMemoryUpgrade } from "../SleeveCovenantPurchases";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

interface IProps {
  index: number;
  rerender: () => void;
  sleeve: Sleeve;
}

export function CovenantSleeveMemoryUpgrade(props: IProps): React.ReactElement {
  const [amt, setAmt] = useState(1);

  function changePurchaseAmount(e: React.ChangeEvent<HTMLInputElement>): void {
    let n = parseInt(e.target.value);

    if (!Number.isInteger(n)) {
      n = 1;
    }
    const maxAmount = 100 - props.sleeve.memory;
    if (n > maxAmount) {
      n = maxAmount;
    }
    if (n < 1) {
      n = 1;
    }

    setAmt(n);
  }

  function purchaseMemory(): void {
    const result = purchaseSleeveMemoryUpgrade(props.sleeve, amt);
    if (!result.success) {
      dialogBoxCreate(result.message);
      return;
    }
    props.rerender();
  }

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <Typography variant="h6" color="primary">
        Upgrade Memory of Sleeve {props.index}
      </Typography>
      <Typography>
        Purchase a memory upgrade for your sleeve. Note that a sleeve's max memory is 100 (current:{" "}
        {formatSleeveMemory(props.sleeve.memory)})
      </Typography>

      <Box display="flex" flexDirection="row" alignItems="center">
        <Typography>Amount of memory to purchase (must be an integer):&nbsp;</Typography>
        <TextField onChange={changePurchaseAmount} type={"number"} value={amt} />
      </Box>
      <br />
      <Button disabled={!canPurchaseMemoryUpgrade(props.sleeve, amt).success} onClick={purchaseMemory}>
        Purchase {amt} memory&nbsp;-&nbsp;
        <Money money={props.sleeve.getMemoryUpgradeCost(amt)} forPurchase={true} />
      </Button>
    </Paper>
  );
}
