import React, { useState } from "react";

import { Modal } from "../../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useCorporation } from "../../ui/Context";
import { Industry } from "src/Corporation/Industry";
import { CityName } from "@nsdefs";
import * as corpConstants from "../../data/Constants";
import { formatMoney, formatNumber } from "../../../ui/formatNumber";
import { removeIndustry } from "../../Actions";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function SellDivisionModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const allIndustries = Object.values(corp.divisions).sort();
  const [industry, setIndustry] = useState(allIndustries[0]);
  const price = calculatePrice();

  function calculatePrice() {
    let price = industry.startingCost;
    for (const city in industry.offices) {
      if (industry.offices[city as CityName] === 0) continue;
      if (city === "Sector-12") continue;
      price += corpConstants.officeInitialCost;
      if (industry.warehouses[city as CityName] !== 0) price += corpConstants.warehouseInitialCost;
    }
    price /= 2;
    return price;
  }

  function onIndustryChange(event: SelectChangeEvent<string>): void {
    setIndustry(corp.divisions.find((div) => div.name === event.target.value) as Industry);
  }

  function sum(total: number, num: number) {
    return total + num;
  }

  function sellDivision() {
    removeIndustry(corp, industry.name);
    corp.funds += price;
    props.onClose();
    dialogBoxCreate(
      <>
        Sold {industry.name} for {formatMoney(price)}, you now have space for{" "}
        {corp.maxDivisions - corp.divisions.length} more divisions.
      </>,
    );
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Would you like to sell a division?
        <br></br>
        You'll get back half the money you've spent on starting the division and expanding to offices and warehouses.
      </Typography>

      <Select value={industry.name} onChange={onIndustryChange}>
        {allIndustries.map((industry) => (
          <MenuItem key={industry.name} value={industry.name}>
            {industry.name}
          </MenuItem>
        ))}
      </Select>
      <Typography>
        Division {industry.name} has:
        <br></br>- Profit: ${formatNumber((industry.lastCycleRevenue - industry.lastCycleExpenses) / 10)} / sec
        <br></br>- Cities:{" "}
        {Object.keys(industry.offices)
          .map((city) => (!!industry.offices[city as CityName] ? 1 : 0))
          .reduce(sum, 0)}
        <br></br>- Warehouses:{" "}
        {Object.keys(industry.warehouses)
          .map((city) => (!!industry.warehouses[city as CityName] ? 1 : 0))
          .reduce(sum, 0)}
        {industry.makesProducts ?? (
          <Typography>
            {" "}
            <br></br>- Products: {industry.products.length}{" "}
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
