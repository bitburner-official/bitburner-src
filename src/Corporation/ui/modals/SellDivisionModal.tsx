import React, { useState } from "react";

import { Modal } from "../../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useCorporation } from "../../ui/Context";
import { CityName } from "@nsdefs";
import * as corpConstants from "../../data/Constants";
import { formatMoney, formatNumber } from "../../../ui/formatNumber";
import { removeIndustry as removeDivision } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function SellDivisionModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const allDivisions = [...corp.divisions.values()];
  const [division, setDivision] = useState(allDivisions[0]);
  const price = calculatePrice();

  function calculatePrice() {
    let price = division.startingCost;
    for (const city in division.offices) {
      if (division.offices[city as CityName] === 0) continue;
      if (city === "Sector-12") continue;
      price += corpConstants.officeInitialCost;
      if (division.warehouses[city as CityName] !== 0) price += corpConstants.warehouseInitialCost;
    }
    price /= 2;
    return price;
  }

  function onDivisionChange(event: SelectChangeEvent): void {
    const div = corp.divisions.get(event.target.value);
    if (!div) return;
    setDivision(div);
  }

  function sum(total: number, num: number) {
    return total + num;
  }

  function sellDivision() {
    removeDivision(corp, division.name);
    corp.funds += price;
    props.onClose();
    dialogBoxCreate(
      `Sold ${division.name} for ${formatMoney(price)}, you now have space for ${
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

      <Select value={division.name} onChange={onDivisionChange}>
        {allDivisions.map((div) => (
          <MenuItem key={div.name} value={div.name}>
            {div.name}
          </MenuItem>
        ))}
      </Select>
      <Typography>
        Division {division.name} has:
        <br></br>- Profit: ${formatNumber((division.lastCycleRevenue - division.lastCycleExpenses) / 10)} / sec
        <br></br>- Cities:{" "}
        {Object.keys(division.offices)
          .map((city) => (division.offices[city as CityName] ? 1 : 0))
          .reduce(sum, 0)}
        <br></br>- Warehouses:{" "}
        {Object.keys(division.warehouses)
          .map((city) => (division.warehouses[city as CityName] ? 1 : 0))
          .reduce(sum, 0)}
        {division.makesProducts ?? (
          <Typography>
            {" "}
            <br></br>- Products: {division.products.length}{" "}
          </Typography>
        )}
        <br></br>
        <br></br>
        Sell price: {formatNumber(price)}
      </Typography>
      <Button disabled={false} onClick={sellDivision}>
        Sell division
      </Button>
    </Modal>
  );
}
