import React from "react";

import { MathJax } from "better-react-mathjax";

import { getRecordEntries } from "../../Types/Record";
import { Division } from "../Division";

interface IProps {
  division: Division;
}

export function IndustryProductEquation(props: IProps): React.ReactElement {
  const reqs = [];
  for (const [reqMat, reqAmt] of getRecordEntries(props.division.requiredMaterials)) {
    if (!reqAmt) continue;
    reqs.push(String.raw`${reqAmt}\text{ }${reqMat}`);
  }
  const prod = props.division.producedMaterials.map((p) => `1\\text{ }${p}`);
  if (props.division.makesProducts) {
    prod.push("Products");
  }

  return <MathJax>{"\\(" + reqs.join("+") + `\\Rightarrow ` + prod.join("+") + "\\)"}</MathJax>;
}
