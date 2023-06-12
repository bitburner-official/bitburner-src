import React from "react";

import Typography from "@mui/material/Typography";

import { MoneyCost } from "./MoneyCost";
import { Corporation } from "../Corporation";
import { IndustryType } from "@enums";
import { IndustriesData } from "../data/IndustryData";

interface IProps {
  industry: IndustryType;
  corp: Corporation;
}

export const IndustryDescription = ({ industry, corp }: IProps) => {
  const data = IndustriesData[industry];
  return (
    <Typography>
      {data.description}
      <br />
      <br />
      Required Materials: {Object.keys(data.requiredMaterials).toString().replace(/,/gi, ", ")}
      <br />
      Produces Materials: {data.producedMaterials ? data.producedMaterials.toString().replace(/,/gi, ", ") : "NONE"}
      <br />
      Produces products: {data.product ? "YES" : "NO"}
      <br />
      <br />
      Starting cost: <MoneyCost money={data.startingCost} corp={corp} />
      <br />
      Recommended starting Industry: {data.recommendStarting ? "YES" : "NO"}
    </Typography>
  );
};
