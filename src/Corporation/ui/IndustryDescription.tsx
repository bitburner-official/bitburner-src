import React from "react";
import { Trans, useTranslation } from "react-i18next";

import Typography from "@mui/material/Typography";

import { CorpMaterialName } from "@nsdefs";
import { IndustryType } from "@enums";

import { IndustriesData } from "../data/IndustryData";
import { getRecordKeys } from "../../Types/Record";
import { Corporation } from "../Corporation";
import { MoneyCost } from "./MoneyCost";

interface IProps {
  industry: IndustryType;
  corp: Corporation;
}

export const IndustryDescription = ({ industry, corp }: IProps) => {
  const { t } = useTranslation("corp");

  const translateMaterials = (materials: CorpMaterialName[] = []) => {
    const labels = materials.map((material) => t(`materials.${material}`));
    return labels.length ? labels.join(", ") : t("industry.none");
  };

  const data = IndustriesData[industry];
  const requiredMaterials = translateMaterials(getRecordKeys(data.requiredMaterials));
  const producesMaterials = translateMaterials(data.producedMaterials);
  const product = t(data.product ? "industry.yes" : "industry.no");
  const recommendedStart = t(data.recommendStarting ? "industry.yes" : "industry.no");

  return (
    <Typography>
      {t(`industries.${industry}.description`)}
      <br />
      <br />
      {t("industry.required-materials", { requiredMaterials })}
      <br />
      {t("industry.produces-materials", { producesMaterials })}
      <br />
      {t("industry.produces-products", { product })}
      <br />
      <br />
      <Trans t={t} i18nKey="industry.starting-cost">
        Starting cost: <MoneyCost money={data.startingCost} corp={corp} />
      </Trans>
      <br />
      {t("industry.recommended-start", { recommendedStart })}
    </Typography>
  );
};
