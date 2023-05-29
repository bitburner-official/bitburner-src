import React from "react";

import { Bladeburner } from "../Bladeburner";
import { OperationElem } from "./OperationElem";

interface IProps {
  bladeburner: Bladeburner;
}

export function OperationList(props: IProps): React.ReactElement {
  const names = Object.keys(props.bladeburner.operations);
  const operations = props.bladeburner.operations;
  return (
    <>
      {names.map((name: string) => (
        <OperationElem key={name} bladeburner={props.bladeburner} action={operations[name]} />
      ))}
    </>
  );
}
