import React, { useState } from "react";

import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { MoneyRate } from "../../../ui/React/MoneyRate";
import { StatsTable } from "../../../ui/React/StatsTable";
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
        以 <Money money={soldPrice} /> 的价格出售了 <b>{divisionToSell.name}</b>，你现在还可以拥有{" "}
        {corp.maxDivisions - corp.divisions.size} 个部门。
      </Typography>,
    );
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography>
          要出售一个部门吗？
          <br></br>
          你将收回创办该部门以及扩张办事处和仓库所花费资金的一半。
        </Typography>
        <Select value={divisionToSell.name} onChange={onDivisionChange}>
          {allDivisions.map((div) => (
            <MenuItem key={div.name} value={div.name}>
              {div.name}
            </MenuItem>
          ))}
        </Select>
        <Typography>部门 {divisionToSell.name} 拥有：</Typography>
        <StatsTable
          rows={[
            [
              "利润：",
              <MoneyRate key="profit" money={divisionToSell.lastCycleRevenue - divisionToSell.lastCycleExpenses} />,
            ],
            ["城市数：", getRecordKeys(divisionToSell.offices).length],
            ["仓库数：", getRecordKeys(divisionToSell.warehouses).length],
            divisionToSell.makesProducts ? ["产品数：", divisionToSell.products.size] : [],
          ]}
        />
        <br />
        <Typography>
          出售价格：<Money money={price} />
        </Typography>
        <Button onClick={sellDivision}>出售部门</Button>
      </>
    </Modal>
  );
}
