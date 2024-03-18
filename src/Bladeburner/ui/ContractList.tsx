import React from "react";
import { BladeContractName } from "@enums";
import { ContractElem } from "./ContractElem";
import { Bladeburner } from "../Bladeburner";

export function ContractList({ bladeburner }: { bladeburner: Bladeburner }): React.ReactElement {
  const names = Object.values(BladeContractName);
  return (
    <>
      {names.map((name) => (
        <ContractElem key={name} bladeburner={bladeburner} action={bladeburner.contracts[name]} />
      ))}
    </>
  );
}
