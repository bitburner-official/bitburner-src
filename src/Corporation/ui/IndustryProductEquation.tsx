import React from "react";
import { Division } from "../Division";
import { getRecordEntries } from "../../Types/Record";
import Typography from "@mui/material/Typography";

interface IProps {
  division: Division;
}

export function IndustryProductEquation(props: IProps): React.ReactElement {
  const reqs = [];
  for (const [reqMat, reqAmt] of getRecordEntries(props.division.requiredMaterials)) {
    if (!reqAmt) {
      continue;
    }
    reqs.push(`${reqAmt} ${reqMat}`);
  }
  const prod = props.division.producedMaterials.map((materialName) => `1 ${materialName}`);
  if (props.division.makesProducts) {
    prod.push("Products");
  }

  return (
    <Typography component="span">
      {reqs.join(" + ")} ⟹ {prod.join(" + ")}
    </Typography>
  );
}
