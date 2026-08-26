import React, { useState } from "react";
import { formatMultiplier, formatPercent } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { OfficeSpace } from "../../OfficeSpace";
import * as actions from "../../Actions";
import { MoneyCost } from "../MoneyCost";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { KEY } from "../../../utils/KeyboardEventKey";

interface IProps {
  open: boolean;
  onClose: () => void;
  office: OfficeSpace;
  rerender: () => void;
}

export function ThrowPartyModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [cost, setCost] = useState(0);

  const totalCost = cost * props.office.numEmployees;
  const canParty = corp.funds >= totalCost;
  function changeCost(event: React.ChangeEvent<HTMLInputElement>): void {
    let x = parseFloat(event.target.value);
    if (isNaN(x)) x = 0;
    setCost(x);
  }

  function throwParty(): void {
    if (cost === null || isNaN(cost) || cost < 0) {
      dialogBoxCreate("输入的数值无效");
    } else if (!canParty) {
      dialogBoxCreate("你的公司资金不足，无法举办派对！");
    } else {
      const mult = actions.throwParty(corp, props.office, cost);
      // Each 10% multiplier gives an extra flat +1 to morale to make recovering from low morale easier.
      const increase = mult > 1 ? (mult - 1) * 0.1 : 0;

      if (mult > 0) {
        dialogBoxCreate(
          "你为办公室举办了一场派对！每位员工的士气提升了 " +
            formatPercent(increase) +
            "，并被乘以了 " +
            formatMultiplier(mult),
        );
      }

      props.rerender();
      props.onClose();
    }
  }

  function EffectText(): React.ReactElement {
    if (isNaN(cost) || cost < 0) return <Typography>输入的数值无效！</Typography>;
    return (
      <Typography>
        举办这场派对将总共花费 <MoneyCost money={totalCost} corp={corp} />
      </Typography>
    );
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) throwParty();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>输入你想为这次办公室派对给每名员工花费的金额</Typography>
      <EffectText />
      <Box display="flex" alignItems="center">
        <TextField autoFocus={true} type="number" value={cost} onChange={changeCost} onKeyDown={onKeyDown} />
        <Button disabled={!canParty} onClick={throwParty}>
          举办派对
        </Button>
      </Box>
    </Modal>
  );
}
