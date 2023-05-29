import React from "react";

import { Bladeburner } from "../Bladeburner";
import { ContractElem } from "./ContractElem";

interface IProps {
  bladeburner: Bladeburner;
}

export function ContractList(props: IProps): React.ReactElement {
  const names = Object.keys(props.bladeburner.contracts);
  const contracts = props.bladeburner.contracts;
  return (
    <>
      {names.map((name: string) => (
        <ContractElem key={name} bladeburner={props.bladeburner} action={contracts[name]} />
      ))}
    </>
  );
}
