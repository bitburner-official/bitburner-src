import React, { useState } from "react";

import { Modal } from "../../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useCorporation } from "../../ui/Context";
import { CityName } from "../../../Enums";
import * as corpConstants from "../../data/Constants";
import { formatMoney } from "../../../ui/formatNumber";
import { removeIndustry as removeDivision } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { getRecordKeys } from "../../../Types/Record";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function SellDivisionModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const allDivisions = [...corp.divisions.values()];
  const [divisionToSell, setDivisionToSell] = useState(allDivisions[0]);
  if (allDivisions.length === 0) return <></>;
  const price = calculatePrice();

  function calculatePrice() {
    let price = divisionToSell.startingCost;
    for (const city of getRecordKeys(divisionToSell.offices)) {
      if (city === CityName.Sector12) continue;
      price += corpConstants.officeInitialCost;
      if (divisionToSell.warehouses[city]) price += corpConstants.warehouseInitialCost;
    }
    price /= 2;
    return price;
  }

  function onDivisionChange(event: SelectChangeEvent): void {
    const div = corp.divisions.get(event.target.value);
    if (!div) return;
    setDivisionToSell(div);
  }

  function sellDivision() {
    removeDivision(corp, divisionToSell.name);
    corp.funds += price;
    props.onClose();
    dialogBoxCreate(
      `Sold ${divisionToSell.name} for ${formatMoney(price)}, you now have space for ${
        corp.maxDivisions - corp.divisions.size
      } more divisions.`,
    );
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Would you like to sell a division?
        <br></br>
        You'll get back half the money you've spent on starting the division and expanding to offices and warehouses.
      </Typography>

      <Select value={divisionToSell.name} onChange={onDivisionChange}>
        {allDivisions.map((div) => (
          <MenuItem key={div.name} value={div.name}>
            {div.name}
          </MenuItem>
        ))}
      </Select>
      <Typography>
        Division {divisionToSell.name} has:
        <br></br>- Profit: {formatMoney((divisionToSell.lastCycleRevenue - divisionToSell.lastCycleExpenses) / 10)} /
        sec
        <br></br>- Cities:{getRecordKeys(divisionToSell.offices).length}
        <br></br>- Warehouses:{getRecordKeys(divisionToSell.warehouses).length}
        {divisionToSell.makesProducts ?? (
          <Typography>
            <br />- Products: {divisionToSell.products.length}
          </Typography>
        )}
        <br></br>
        <br></br>
        Sell price: {formatMoney(price)}
      </Typography>
      <Button disabled={false} onClick={sellDivision}>
        Sell division
      </Button>
    </Modal>
  );
}
