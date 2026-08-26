// React Component for displaying an Division's overview information
// (top-left panel in the Division UI)
import React, { useState } from "react";

import { IndustryType } from "@enums";
import { hireAdVert } from "../Actions";
import { formatBigNumber, formatCorpMultiplier } from "../../ui/formatNumber";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { MakeProductModal } from "./modals/MakeProductModal";
import { ResearchModal } from "./modals/ResearchModal";
import { Money } from "../../ui/React/Money";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { StatsTable } from "../../ui/React/StatsTable";
import { StaticModal } from "../../ui/React/StaticModal";
import { MoneyCost } from "./MoneyCost";
import { useCorporation, useDivision } from "./Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

function MakeProductButton(): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [makeOpen, setMakeOpen] = useState(false);

  const hasMaxProducts = division.hasMaximumNumberProducts();

  function shouldFlash(): boolean {
    return division.products.size === 0;
  }

  function onButtonClick() {
    if (hasMaxProducts) return;
    setMakeOpen(true);
  }

  let createProductButtonText = "";
  switch (division.industry) {
    case IndustryType.Restaurant:
      createProductButtonText = "开设餐厅";
      break;
    case IndustryType.Tobacco:
      createProductButtonText = "开发产品";
      break;
    case IndustryType.Pharmaceutical:
      createProductButtonText = "研发药品";
      break;
    case IndustryType.Computers:
      createProductButtonText = "开发产品";
      break;
    case IndustryType.Robotics:
      createProductButtonText = "设计机器人";
      break;
    case IndustryType.Software:
      createProductButtonText = "开发软件";
      break;
    case IndustryType.Healthcare:
      createProductButtonText = "建造医院";
      break;
    case IndustryType.RealEstate:
      createProductButtonText = "开发地产";
      break;
    default:
      createProductButtonText = "开发产品";
      return <></>;
  }

  const disabledText = hasMaxProducts
    ? `${division.name} 已达到最大产品数量（${division.maxProducts}）`
    : corp.funds < 0
    ? "企业资金不足"
    : "";

  return (
    <>
      <ButtonWithTooltip
        disabledTooltip={disabledText}
        onClick={onButtonClick}
        buttonProps={{ color: shouldFlash() ? "error" : "primary" }}
      >
        {createProductButtonText}
      </ButtonWithTooltip>
      <MakeProductModal open={makeOpen} onClose={() => setMakeOpen(false)} />
    </>
  );
}

interface DivisionOverviewProps {
  rerender: () => void;
}

export function DivisionOverview(props: DivisionOverviewProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [helpOpen, setHelpOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const profit = division.lastCycleRevenue - division.lastCycleExpenses;

  const advertisingFactors = division.getAdvertisingFactors();
  const awarenessFac = advertisingFactors[1];
  const popularityFac = advertisingFactors[2];
  const ratioFac = advertisingFactors[3];
  const totalAdvertisingFac = advertisingFactors[0];

  function convertEffectFacToGraphic(fac: number): string {
    return createProgressBarText({
      progress: fac,
      totalTicks: 20,
    });
  }

  return (
    <Paper>
      <Typography>
        行业：{division.industry}（企业资金：<Money money={corp.funds} />）
      </Typography>
      <br />
      <StatsTable
        rows={[
          ["知名度：", formatBigNumber(division.awareness)],
          ["受欢迎度：", formatBigNumber(division.popularity)],
        ]}
      />
      <Tooltip
        title={
          <>
            <Typography>该行业的知名度和受欢迎度对其销售的倍率加成。</Typography>
            <br />
            <Typography>
              {division.industry}行业：𝞪 = {division.advertisingFactor}
            </Typography>
            <br />
            <MathNotationOutput notation={MathNotation.CorpAdvertFactor} />
            <br />
            <StatsTable
              rows={[
                ["知名度加成：", formatCorpMultiplier(Math.pow(awarenessFac, 0.85))],
                ["受欢迎度加成：", formatCorpMultiplier(Math.pow(popularityFac, 0.85))],
                ["比率倍率：", formatCorpMultiplier(Math.pow(ratioFac, 0.85))],
                [<b key={1}>总计：</b>, <b key={2}>{formatCorpMultiplier(totalAdvertisingFac)}</b>],
              ]}
            />
          </>
        }
      >
        <Typography>广告倍率：{formatCorpMultiplier(totalAdvertisingFac)}</Typography>
      </Tooltip>
      <br />
      <StatsTable
        rows={[
          ["收入：", <MoneyRate key="revenue" money={division.lastCycleRevenue} />],
          ["支出：", <MoneyRate key="expenses" money={division.lastCycleExpenses} />],
          ["利润：", <MoneyRate key="profit" money={profit} />],
        ]}
      />
      <br />
      <Box display="flex" alignItems="center">
        <Tooltip
          title={
            <>
              拥有硬件、机器人、AI核心和房地产等增产材料带来的产量提升。
            </>
          }
        >
          <Typography>生产倍率：{formatCorpMultiplier(division.productionMult)}</Typography>
        </Tooltip>
        <IconButton onClick={() => setHelpOpen(true)}>
          <HelpIcon />
        </IconButton>
        <StaticModal open={helpOpen} onClose={() => setHelpOpen(false)}>
          <Typography>
            拥有硬件、机器人、AI核心和房地产可以提升你行业的产量。这些材料对产量的影响因行业而异。例如，房地产可能对某些行业非常有效，而对另一些行业则毫无效果。
            <br />
            <br />
            本部门的生产倍率是将各个办公地点的单独生产倍率相加得出的。该生产倍率会应用于每个办事处。因此，扩张到新城市是有益的，这可以大幅提升整个部门的生产倍率。
            <br />
            <br />
            以下是每种材料对提升该行业生产倍率的有效程度近似值（条越长越有效）：
            <br />
            <br />
            硬件（Hardware）：&nbsp;&nbsp;&nbsp; {convertEffectFacToGraphic(division.hardwareFactor)}
            <br />
            机器人（Robots）：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {convertEffectFacToGraphic(division.robotFactor)}
            <br />
            AI核心（AI Cores）：&nbsp;&nbsp;&nbsp; {convertEffectFacToGraphic(division.aiCoreFactor)}
            <br />
            房地产（Real Estate）：{convertEffectFacToGraphic(division.realEstateFactor)}
          </Typography>
        </StaticModal>
      </Box>
      <Box display="flex" alignItems="center">
        <Tooltip title={"科研可以提高你所生产的材料和产品的质量。"}>
          <Typography>科研：{formatBigNumber(division.researchPoints)}</Typography>
        </Tooltip>
        <Button sx={{ mx: 1 }} onClick={() => setResearchOpen(true)}>
          研究
        </Button>
        <ResearchModal open={researchOpen} onClose={() => setResearchOpen(false)} industry={division} />
      </Box>
      <br />
      <Box display="flex" alignItems="center">
        <ButtonWithTooltip
          normalTooltip={
            <>
              雇用 <b>AdVert.Inc</b> 为你的公司做广告。该升级的每一级都会使公司的知名度和受欢迎度分别静态提升3点和1点。之后它还会让公司的知名度提升0.5%，受欢迎度随机提升0.5%至1.5%。这些效果会被其他增强广告效果的升级进一步提高。
            </>
          }
          disabledTooltip={division.getAdVertCost() > corp.funds ? "企业资金不足" : ""}
          onClick={() => {
            hireAdVert(corp, division);
            props.rerender();
          }}
        >
          投放广告 -&nbsp; <MoneyCost money={division.getAdVertCost()} corp={corp} />
        </ButtonWithTooltip>
        {division.makesProducts && <MakeProductButton />}
      </Box>
    </Paper>
  );
}
