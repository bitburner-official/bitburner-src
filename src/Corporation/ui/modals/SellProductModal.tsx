import type { CityName } from "@enums";
import type { Division } from "../../Division";
import type { Product } from "../../Product";

import React, { useState } from "react";
import { Button, FormControlLabel, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { Modal } from "../../../ui/React/Modal";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

import * as actions from "../../Actions";
import { KEY } from "../../../utils/KeyboardEventKey";

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
  const [amt, setAmt] = useState<string>(String(props.product.cityData[props.city].desiredSellAmount));
  const [price, setPrice] = useState<string>(String(props.product.cityData[props.city].desiredSellPrice));

  function onCheckedChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setChecked(event.target.checked);
  }

  function sellProduct(): void {
    try {
      actions.sellProduct(props.product, props.city, amt, price, checked);
    } catch (error) {
      dialogBoxCreate(String(error));
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
    if (event.key === KEY.ENTER) sellProduct();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        输入你每秒想要出售的 {props.product.name} 最大数量，以及你想要的出售价格。
        <br />
        <br />
        如果出售数量设为0，则该产品不会被出售。如果出售价格设为0，则该产品会被丢弃。
        <br />
        <br />
        将出售数量设为'MAX'会让你始终以最大可能数量出售该产品。
        <br />
        <br />
        设置出售数量时，你可以使用'PROD'变量来指定一个随产量动态变化的数量。例如，如果你把出售数量设为'PROD-1'，那么你出售的数量将始终比你生产的少1。
        <br />
        <br />
        设置出售价格时，你可以使用'MP'变量来设置一个随该产品预计市场价格动态变化的价格。例如，如果你把它设为'MP*5'，那么它将始终以预计市场价的五倍出售。
      </Typography>
      <br />
      <TextField
        value={amt}
        autoFocus={true}
        type="text"
        placeholder="出售数量"
        onChange={onAmtChange}
        onKeyDown={onKeyDown}
      />
      <TextField value={price} type="text" placeholder="出售价格" onChange={onPriceChange} onKeyDown={onKeyDown} />
      <Button onClick={sellProduct} style={{ marginLeft: ".5rem", marginRight: ".5rem" }}>
        确认
      </Button>
      <FormControlLabel
        style={{ marginRight: ".5rem" }}
        control={<Switch checked={checked} onChange={onCheckedChange} />}
        label={<Typography>对所有城市生效</Typography>}
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
                  启用后，该物品将自动以市场价+加价幅度出售。
                  <br />
                  这会覆盖玩家设置的价格，并且会被已启用的TA2覆盖。
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
                  启用后，该物品将自动以最优价格出售，使售出的数量与指定的数量一致。
                  <br />
                  这会覆盖玩家设置的价格和TA1。
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
