import React, { useState } from "react";
import { formatMultiplier, formatPercent } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { OfficeSpace } from "../../OfficeSpace";
import { ThrowParty } from "../../Actions";
import { Money } from "../../../ui/React/Money";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { KEY } from "../../../utils/helpers/keyCodes";

interface IProps {
  open: boolean;
  onClose: () => void;
  office: OfficeSpace;
  rerender: () => void;
}

export function ThrowPartyModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [cost, setCost] = useState(0);

  const totalCost = cost * props.office.totalEmployees;
  const canParty = corp.funds >= totalCost;
  function changeCost(event: React.ChangeEvent<HTMLInputElement>): void {
    let x = parseFloat(event.target.value);
    if (isNaN(x)) x = 0;
    setCost(x);
  }

  function throwParty(): void {
    if (cost === null || isNaN(cost) || cost < 0) {
      dialogBoxCreate("Invalid value entered");
    } else if (!canParty) {
      dialogBoxCreate("You don't have enough company funds to throw a party!");
    } else {
      const mult = ThrowParty(corp, props.office, cost);
      // Each 5% multiplier gives an extra flat +1 to morale and happiness to make recovering from low morale easier.
      const increase = mult > 1 ? (mult - 1) * 0.2 : 0;

      if (mult > 0) {
        dialogBoxCreate(
          "You threw a party for the office! The morale and happiness of each employee increased by " +
            formatPercent(increase) +
            " and was multiplied by " +
            formatMultiplier(mult),
        );
      }

      props.rerender();
      props.onClose();
    }
  }

  function EffectText(): React.ReactElement {
    if (isNaN(cost) || cost < 0) return <Typography>Invalid value entered!</Typography>;
    return (
      <Typography>
        Throwing this party will cost a total of <Money money={totalCost} />
      </Typography>
    );
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) throwParty();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>Enter the amount of money you would like to spend PER EMPLOYEE on this office party</Typography>
      <EffectText />
      <Box display="flex" alignItems="center">
        <TextField
          autoFocus={true}
          type="number"
          placeholder="$ / employee"
          value={cost}
          onChange={changeCost}
          onKeyDown={onKeyDown}
        />
        <Button disabled={!canParty} onClick={throwParty}>
          Throw Party
        </Button>
      </Box>
    </Modal>
  );
}
