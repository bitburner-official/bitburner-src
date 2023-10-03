import React from "react";
import { Division } from "../Division";
import { MathJax } from "better-react-mathjax";
import { getRecordEntries } from "../../Types/Record";

interface IProps {
  division: Division;
}

export function IndustryProductEquation(props: IProps): React.ReactElement {
  const reqs = [];
  for (const [reqMat, reqAmt] of getRecordEntries(props.division.requiredMaterials)) {
    if (!reqAmt) continue;
    reqs.push(String.raw`${reqAmt}\;\textit{${reqMat}}`);
  }
  const prod = props.division.producedMaterials.map((p) => `1\\;\\textit{${p}}`);
  if (props.division.makesProducts) {
    prod.push("\\textit{Products}");
  }

  return <MathJax>{"\\(" + reqs.join("+") + `\\Rightarrow ` + prod.join("+") + "\\)"}</MathJax>;
}
