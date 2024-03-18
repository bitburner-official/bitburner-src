import React from "react";
import { blackOpsArray } from "../data/BlackOperations";
import { BlackOperation } from "../Actions/BlackOperation";
import { BlackOpElem } from "./BlackOpElem";
import { Bladeburner } from "../Bladeburner";

interface BlackOpListProps {
  bladeburner: Bladeburner;
}

export function BlackOpList({ bladeburner }: BlackOpListProps): React.ReactElement {
  const blackOps = blackOpsArray.slice(0, bladeburner.numBlackOpsComplete + 1);

  return (
    <>
      {blackOps.map((blackOp: BlackOperation) => (
        <BlackOpElem key={blackOp.name} bladeburner={bladeburner} blackOp={blackOp} />
      ))}
    </>
  );
}
