import type { Bladeburner } from "../Bladeburner";

import * as React from "react";
import { ContractElem } from "./ContractElem";
import { Typography } from "@mui/material";

interface ContractPageProps {
  bladeburner: Bladeburner;
}

export function ContractPage({ bladeburner }: ContractPageProps): React.ReactElement {
  const contracts = Object.values(bladeburner.contracts);
  return (
    <>
      <Typography>
        完成合约可以提高你的Bladeburner声望并赚取资金。合约失败会让你损失生命值，甚至可能导致住院。
        <br />
        <br />
        成功完成合约可以解锁更高等级的合约。更高等级的合约难度更大，但给予更多声望、经验和资金。
      </Typography>
      {contracts.map((contract) => (
        <ContractElem key={contract.name} bladeburner={bladeburner} action={contract} />
      ))}
    </>
  );
}
