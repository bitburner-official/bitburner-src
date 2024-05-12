import type { Division } from "../../Division";
import type { Material } from "../../Material";

import React, { useState } from "react";
import { Button, FormControlLabel, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { Modal } from "../../../ui/React/Modal";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

import * as actions from "../../Actions";
import { KEY } from "../../../utils/helpers/keyCodes";

interface IProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
  div: Division;
}

// Create a popup that let the player manage sales of a material
export function SellMaterialModal(props: IProps): React.ReactElement {
  const [amt, setAmt] = useState<string>(String(props.mat.desiredSellAmount));
  const [price, setPrice] = useState<string>(String(props.mat.desiredSellPrice));

  function sellMaterial(): void {
    try {
      actions.sellMaterial(props.mat, amt, price);
    } catch (err) {
      dialogBoxCreate(err + "");
    }
    props.onClose();
  }

  function onAmtChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setAmt(event.target.value);
  }

  function onPriceChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setPrice(event.target.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) sellMaterial();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the maximum amount of {props.mat.name} you would like to sell per second, as well as the price at which
        you would like to sell.
        <br />
        <br />
        If the sell amount is set to 0, then the material will not be sold. If the sell price is set to 0, then the
        material will be discarded.
        <br />
        <br />
        Setting the sell amount to 'MAX' will result in you always selling the maximum possible amount of the material.
        <br />
        <br />
        When setting the sell amount, you can use the 'PROD' variable to designate a dynamically changing amount that
        depends on your production. For example, if you set the sell amount to 'PROD-5' then you will always sell 5 less
        of the material than you produce.
        <br />
        <br />
        When setting the sell price, you can use the 'MP' variable to designate a dynamically changing price that
        depends on the market price. For example, if you set the sell price to 'MP+10' then it will always be sold at
        $10 above the market price.
      </Typography>
      <br />
      <TextField
        value={amt}
        autoFocus={true}
        type="text"
        placeholder="Sell amount"
        onChange={onAmtChange}
        onKeyDown={onKeyDown}
      />
      <TextField value={price} type="text" placeholder="Sell price" onChange={onPriceChange} onKeyDown={onKeyDown} />
      <Button onClick={sellMaterial} style={{ marginLeft: ".5rem", marginRight: ".5rem" }}>
        Confirm
      </Button>
      {props.div.hasResearch("Market-TA.I") && (
        <FormControlLabel
          style={{ marginRight: "1rem" }}
          control={
            <Switch checked={props.mat.marketTa1} onChange={(event) => (props.mat.marketTa1 = event.target.checked)} />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  If this is enabled, then this Material will automatically be sold at market price + markup.
                  <br />
                  This overrides player set pricing and gets overriden by an active TA2.
                </Typography>
              }
            >
              <Typography>Market-TA.I</Typography>
            </Tooltip>
          }
        />
      )}
      {props.div.hasResearch("Market-TA.II") && (
        <FormControlLabel
          control={
            <Switch checked={props.mat.marketTa2} onChange={(event) => (props.mat.marketTa2 = event.target.checked)} />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  If this is enabled, then this Material will automatically be sold at the optimal price such that the
                  amount sold matches the amount specified.
                  <br />
                  This overrides player set pricing and TA1.
                </Typography>
              }
            >
              <Typography>Market-TA.II</Typography>
            </Tooltip>
          }
        />
      )}
    </Modal>
  );
}
