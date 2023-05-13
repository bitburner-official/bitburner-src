import React from "react";
import { Division } from "../Division";
import { MathJax } from "better-react-mathjax";
import { CorpMaterialName } from "@nsdefs";

interface IProps {
  division: Division;
}

export function IndustryProductEquation(props: IProps): React.ReactElement {
  const reqs = [];
  for (const reqMat of Object.keys(props.division.requiredMaterials) as CorpMaterialName[]) {
    const reqAmt = props.division.requiredMaterials[reqMat];
    if (reqAmt === undefined) continue;
    reqs.push(String.raw`${reqAmt}\text{ }${reqMat}`);
  }
  const prod = props.division.producedMaterials.map((p) => `1\\text{ }${p}`);
  if (props.division.makesProducts) {
    prod.push("Products");
  }

  return <MathJax>{"\\(" + reqs.join("+") + `\\Rightarrow ` + prod.join("+") + "\\)"}</MathJax>;
}
