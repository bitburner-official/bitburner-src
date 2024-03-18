import React from "react";
import { BladeOperationName } from "@enums";
import { OperationElem } from "./OperationElem";
import { Bladeburner } from "../Bladeburner";

export function OperationList({ bladeburner }: { bladeburner: Bladeburner }): React.ReactElement {
  const names = Object.values(BladeOperationName);
  return (
    <>
      {names.map((name) => (
        <OperationElem key={name} bladeburner={bladeburner} operation={bladeburner.operations[name]} />
      ))}
    </>
  );
}
