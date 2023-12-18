import React, { useState } from "react";

import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useCorporation } from "../../ui/Context";
import { removeDivision } from "../../Actions";
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
  const price = divisionToSell.calculateRecoupableValue();

  function onDivisionChange(event: SelectChangeEvent): void {
    const div = corp.divisions.get(event.target.value);
    if (!div) return;
    setDivisionToSell(div);
  }

  function sellDivision() {
    const soldPrice = removeDivision(corp, divisionToSell.name);
    props.onClose();
    dialogBoxCreate(
      <Typography>
        Sold <b>{divisionToSell.name}</b> for <Money money={soldPrice} />, you now have space for
        {corp.maxDivisions - corp.divisions.size} more divisions.
      </Typography>,
    );
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
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
        <Typography>Division {divisionToSell.name} has:</Typography>
        <Typography>
          Profit: <Money money={(divisionToSell.lastCycleRevenue - divisionToSell.lastCycleExpenses) / 10} /> / sec{" "}
        </Typography>
        <Typography>Cities:{getRecordKeys(divisionToSell.offices).length}</Typography>
        <Typography>Warehouses:{getRecordKeys(divisionToSell.warehouses).length}</Typography>
        {divisionToSell.makesProducts ?? <Typography>Products: {divisionToSell.products.size}</Typography>}
        <br />
        <Typography>
          Sell price: <Money money={price} />
        </Typography>
        <Button onClick={sellDivision}>Sell division</Button>
      </>
    </Modal>
  );
}
