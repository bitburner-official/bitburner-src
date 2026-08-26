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
      所需材料：{Object.keys(data.requiredMaterials).toString().replace(/,/gi, ", ")}
      <br />
      产出材料：{data.producedMaterials ? data.producedMaterials.toString().replace(/,/gi, ", ") : "无"}
      <br />
      可开发产品：{data.product ? "是" : "否"}
      <br />
      <br />
      起始费用：<MoneyCost money={data.startingCost} corp={corp} />
      <br />
      推荐的起步行业：{data.recommendStarting ? "是" : "否"}
    </Typography>
  );
};
