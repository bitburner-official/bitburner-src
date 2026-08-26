import type { Division } from "../../Division";
import type { Material } from "../../Material";

import React, { useState } from "react";
import { Button, FormControlLabel, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { Modal } from "../../../ui/React/Modal";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

import * as actions from "../../Actions";
import { KEY } from "../../../utils/KeyboardEventKey";

import { formatMoney } from "../../../ui/formatNumber";

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
    if (event.key === KEY.ENTER) sellMaterial();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        输入你每秒想要出售的 {props.mat.name} 最大数量，以及你想要的出售价格。
        <br />
        <br />
        如果出售数量设为0，则该材料不会被出售。如果出售价格设为0，则该材料会被丢弃。
        <br />
        <br />
        将出售数量设为'MAX'会让你始终以最大可能数量出售该材料。
        <br />
        <br />
        设置出售数量时，你可以使用'PROD'变量来指定一个随产量动态变化的数量。例如，如果你把出售数量设为'PROD-5'，那么你出售的数量将始终比你生产的少5。
        <br />
        <br />
        设置出售价格时，你可以使用'MP'变量来指定一个随市场价格动态变化的价格。例如，如果你把出售价格设为'MP+10'，那么它将始终以{" "}
        {formatMoney(10)} 的溢价（高于市场价）出售。
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
      <Button onClick={sellMaterial} style={{ marginLeft: ".5rem", marginRight: ".5rem" }}>
        确认
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
                  启用后，这种材料将自动以市场价+加价幅度出售。
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
            <Switch checked={props.mat.marketTa2} onChange={(event) => (props.mat.marketTa2 = event.target.checked)} />
          }
          label={
            <Tooltip
              title={
                <Typography>
                  启用后，这种材料将自动以最优价格出售，使售出的数量与指定的数量一致。
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
