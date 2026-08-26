import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { MaterialInfo } from "../../MaterialInfo";
import { Warehouse } from "../../Warehouse";
import { Material } from "../../Material";
import { formatMatPurchaseAmount } from "../../../ui/formatNumber";
import * as actions from "../../Actions";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation, useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../../utils/KeyboardEventKey";

interface IBulkPurchaseTextProps {
  warehouse: Warehouse;
  mat: Material;
  amount: string;
}

interface IBPProps {
  onClose: () => void;
  mat: Material;
  warehouse: Warehouse;
}

function BulkPurchaseSection(props: IBPProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [buyAmt, setBuyAmt] = useState("");
  const [disabled, setDisabled] = useState(false);

  function BulkPurchaseText(props: IBulkPurchaseTextProps): React.ReactElement {
    const parsedAmt = parseFloat(props.amount);
    const cost = parsedAmt * props.mat.marketPrice;

    const matSize = MaterialInfo[props.mat.name].size;
    const maxAmount = (props.warehouse.size - props.warehouse.sizeUsed) / matSize;

    if (parsedAmt > maxAmount) {
      setDisabled(true);
      return (
        <>
          <Typography color={"error"}>仓库空间不足，无法购买这一数量</Typography>
        </>
      );
    } else if (isNaN(cost) || parsedAmt < 0) {
      setDisabled(true);
      return (
        <>
          <Typography color={"error"}>批量购买数量输入无效</Typography>
        </>
      );
    } else {
      setDisabled(false);
      return (
        <>
          <Typography>
            购买 {formatMatPurchaseAmount(parsedAmt)} 的 {props.mat.name} 将花费 <Money money={cost} />
          </Typography>
        </>
      );
    }
  }

  function bulkPurchase(): void {
    try {
      actions.bulkPurchase(corp, division, props.warehouse, props.mat, parseFloat(buyAmt));
    } catch (error) {
      dialogBoxCreate(String(error));
    }
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) bulkPurchase();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setBuyAmt(event.target.value);
  }

  return (
    <>
      <Typography>
        输入你想要批量购买的 {props.mat.name} 数量。这会立即（一次性）购买指定数量。
      </Typography>
      <BulkPurchaseText warehouse={props.warehouse} mat={props.mat} amount={buyAmt} />
      <TextField
        value={buyAmt}
        onChange={onChange}
        type="number"
        placeholder="批量购买数量"
        onKeyDown={onKeyDown}
      />
      <Button disabled={disabled} onClick={bulkPurchase}>
        确认批量购买
      </Button>
    </>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
  warehouse: Warehouse;
  disablePurchaseLimit: boolean;
}

// Create a popup that lets the player purchase a Material
export function PurchaseMaterialModal(props: IProps): React.ReactElement {
  const division = useDivision();
  const [buyAmt, setBuyAmt] = useState(props.mat.buyAmount ? props.mat.buyAmount : 0);

  function purchaseMaterial(): void {
    if (buyAmt === null) return;
    try {
      actions.buyMaterial(division, props.mat, buyAmt);
    } catch (error) {
      dialogBoxCreate(String(error));
    }

    props.onClose();
  }

  function clearPurchase(): void {
    props.mat.buyAmount = 0;
    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) purchaseMaterial();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setBuyAmt(parseFloat(event.target.value));
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        输入你每秒想要购买的 {props.mat.name} 数量。这种材料的成本在不断变化。
        {props.disablePurchaseLimit ? " 注意：由于已启用智能供应，购买数量不可修改" : ""}
      </Typography>
      <TextField
        value={buyAmt}
        onChange={onChange}
        autoFocus={true}
        placeholder="购买数量"
        type="number"
        disabled={props.disablePurchaseLimit}
        onKeyDown={onKeyDown}
      />
      <Button disabled={props.disablePurchaseLimit} onClick={purchaseMaterial}>
        确认
      </Button>
      <Button disabled={props.disablePurchaseLimit} onClick={clearPurchase}>
        清除购买
      </Button>
      {<BulkPurchaseSection onClose={props.onClose} mat={props.mat} warehouse={props.warehouse} />}
    </Modal>
  );
}
