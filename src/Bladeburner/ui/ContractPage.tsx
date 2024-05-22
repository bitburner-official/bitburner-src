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
        Complete contracts in order to increase your Bladeburner rank and earn money. Failing a contract will cause you
        to lose HP, which can lead to hospitalization.
        <br />
        <br />
        You can unlock higher-level contracts by successfully completing them. Higher-level contracts are more
        difficult, but grant more rank, experience, and money.
      </Typography>
      {contracts.map((contract) => (
        <ContractElem key={contract.name} bladeburner={bladeburner} action={contract} />
      ))}
    </>
  );
}
