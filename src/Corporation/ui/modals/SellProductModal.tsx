import type { CityName } from "@enums";
import type { Division } from "../../Division";
import type { Product } from "../../Product";

import React, { useState } from "react";
import { Button, FormControlLabel, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { Modal } from "../../../ui/React/Modal";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

import * as actions from "../../Actions";
import { KEY } from "../../../utils/helpers/keyCodes";

interface IProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  city: CityName;
  div: Division;
}

// Create a popup that let the player manage sales of a material
export function SellProductModal(props: IProps): React.ReactElement {
  const [checked, setChecked] = useState(true);
  const [iQty, setQty] = useState<string>(String(props.product.cityData[props.city].desiredSellAmount));
  const [px, setPx] = useState<string>(String(props.product.cityData[props.city].desiredSellPrice));

  function onCheckedChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setChecked(event.target.checked);
  }

  function sellProduct(): void {
    try {
      actions.sellProduct(props.product, props.city, iQty, px, checked);
    } catch (err) {
      dialogBoxCreate(err + "");
    }

    props.onClose();
  }

  function onAmtChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setQty(event.target.value);
  }

  function onPriceChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setPx(event.target.value);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) sellProduct();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Enter the maximum amount of {props.product.name} you would like to sell per second, as well as the price at
        which you would like to sell.
        <br />
        <br />
        If the sell amount is set to 0, then the product will not be sold. If the sell price is set to 0, then the
        product will be discarded.
        <br />
        <br />
        Setting the sell amount to 'MAX' will result in you always selling the maximum possible amount of the product.
        <br />
        <br />
        When setting the sell amount, you can use the 'PROD' variable to designate a dynamically changing amount that
        depends on your production. For example, if you set the sell amount to 'PROD-1' then you will always sell 1 less
        of the product than you produce.
        <br />
        <br />
        When setting the sell price, you can use the 'MP' variable to set a dynamically changing price that depends on
        the product's estimated market price. For example, if you set it to 'MP*5' then it will always be sold at five
        times the estimated market price.
      </Typography>
      <br />
      <TextField
        value={iQty}
        autoFocus={true}
        type="text"
        placeholder="Sell amount"
        onChange={onAmtChange}
        onKeyDown={onKeyDown}
      />
      <TextField value={px} type="text" placeholder="Sell price" onChange={onPriceChange} onKeyDown={onKeyDown} />
      <Button onClick={sellProduct} style={{ marginLeft: ".5rem", marginRight: ".5rem" }}>
        Confirm
      </Button>
      <FormControlLabel
        style={{ marginRight: ".5rem" }}
        control={<Switch checked={checked} onChange={onCheckedChange} />}
        label={<Typography>Set for all cities</Typography>}
      />
      {props.div.hasResearch("Market-TA.I") && (
        <FormControlLabel
          style={{ marginRight: "1rem" }}
          control={
            <Switch
              checked={props.product.marketTa1}
              onChange={(event) => (props.product.marketTa1 = event.target.checked)}
            />
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
            <Switch
              checked={props.product.marketTa2}
              onChange={(event) => (props.product.marketTa2 = event.target.checked)}
            />
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
