import React from "react";
import { Industry } from "../Industry";
import { MathJax } from "better-react-mathjax";
import { CorpMaterialName } from "@nsdefs";

interface IProps {
  division: Industry;
}

export function IndustryProductEquation(props: IProps): React.ReactElement {
  const reqs = [];
  for (const reqMat of Object.keys(props.division.reqMats) as CorpMaterialName[]) {
    const reqAmt = props.division.reqMats[reqMat];
    if (reqAmt === undefined) continue;
    reqs.push(String.raw`${reqAmt}\text{ }${reqMat}`);
  }
  const prod = props.division.prodMats.map((p) => `1\\text{ }${p}`);
  if (props.division.makesProducts) {
    prod.push("Products");
  }

  return <MathJax>{"\\(" + reqs.join("+") + `\\Rightarrow ` + prod.join("+") + "\\)"}</MathJax>;
}
