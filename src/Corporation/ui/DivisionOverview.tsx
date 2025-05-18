// React Component for displaying an Division's overview information
// (top-left panel in the Division UI)
import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";

import { CorpUnlockName, IndustryType } from "@enums";
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
  switch (division.type) {
    case IndustryType.Restaurant:
      createProductButtonText = "Build Restaurant";
      break;
    case IndustryType.Tobacco:
      createProductButtonText = "Create Product";
      break;
    case IndustryType.Pharmaceutical:
      createProductButtonText = "Create Drug";
      break;
    case IndustryType.Computers:
      createProductButtonText = "Create Product";
      break;
    case IndustryType.Robotics:
      createProductButtonText = "Design Robot";
      break;
    case IndustryType.Software:
      createProductButtonText = "Develop Software";
      break;
    case IndustryType.Healthcare:
      createProductButtonText = "Build Hospital";
      break;
    case IndustryType.RealEstate:
      createProductButtonText = "Develop Property";
      break;
    default:
      createProductButtonText = "Create Product";
      return <></>;
  }

  const disabledText = hasMaxProducts
    ? `${division.name} already has the maximum number of products (${division.maxProducts})`
    : corp.funds < 0
    ? "Insufficient corporation funds"
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

  let advertisingInfo = false;
  const advertisingFactors = division.getAdvertisingFactors();
  const awarenessFac = advertisingFactors[1];
  const popularityFac = advertisingFactors[2];
  const ratioFac = advertisingFactors[3];
  const totalAdvertisingFac = advertisingFactors[0];
  if (corp.unlocks.has(CorpUnlockName.VeChain)) {
    advertisingInfo = true;
  }

  function convertEffectFacToGraphic(fac: number): string {
    return createProgressBarText({
      progress: fac,
      totalTicks: 20,
    });
  }

  return (
    <Paper>
      <Typography>
        Industry: {division.type} (Corp Funds: <Money money={corp.funds} />)
      </Typography>
      <br />
      <StatsTable
        rows={[
          ["Awareness:", formatBigNumber(division.awareness)],
          ["Popularity:", formatBigNumber(division.popularity)],
        ]}
      />
      {advertisingInfo && (
        <Tooltip
          title={
            <>
              <Typography>Multiplier for this industry's sales due to its awareness and popularity.</Typography>
              <br />
              <MathJax>{`\\(\\text{${division.type} Industry: }\\alpha = ${division.advertisingFactor}\\)`}</MathJax>
              <MathJax>{`\\(\\text{multiplier} = \\left((\\text{awareness}+1)^{\\alpha} \\times (\\text{popularity}+1)^{\\alpha} \\times \\frac{\\text{popularity}+0.001}{\\text{awareness}}\\right)^{0.85}\\)`}</MathJax>
              <br />
              <StatsTable
                rows={[
                  ["Awareness Bonus:", formatCorpMultiplier(Math.pow(awarenessFac, 0.85))],
                  ["Popularity Bonus:", formatCorpMultiplier(Math.pow(popularityFac, 0.85))],
                  ["Ratio Multiplier:", formatCorpMultiplier(Math.pow(ratioFac, 0.85))],
                  [<b key={1}>Total:</b>, <b key={2}>{formatCorpMultiplier(totalAdvertisingFac)}</b>],
                ]}
              />
            </>
          }
        >
          <Typography>Advertising Multiplier: {formatCorpMultiplier(totalAdvertisingFac)}</Typography>
        </Tooltip>
      )}
      <br />
      <StatsTable
        rows={[
          ["Revenue:", <MoneyRate key="revenue" money={division.lastCycleRevenue} />],
          ["Expenses:", <MoneyRate key="expenses" money={division.lastCycleExpenses} />],
          ["Profit:", <MoneyRate key="profit" money={profit} />],
        ]}
      />
      <br />
      <Box display="flex" alignItems="center">
        <Tooltip
          title={
            <>
              Production gain from owning production-boosting materials such as
              <br />
              hardware, Robots, AI Cores, and Real Estate.
            </>
          }
        >
          <Typography>Production Multiplier: {formatCorpMultiplier(division.productionMult)}</Typography>
        </Tooltip>
        <IconButton onClick={() => setHelpOpen(true)}>
          <HelpIcon />
        </IconButton>
        <StaticModal open={helpOpen} onClose={() => setHelpOpen(false)}>
          <Typography>
            Owning Hardware, Robots, AI Cores, and Real Estate can boost your Industry's production. The effect these
            materials have on your production varies between Industries. For example, Real Estate may be very effective
            for some Industries, but ineffective for others.
            <br />
            <br />
            This division's production multiplier is calculated by summing the individual production multiplier of each
            of its office locations. This production multiplier is applied to each office. Therefore, it is beneficial
            to expand into new cities as this can greatly increase the production multiplier of your entire Division.
            <br />
            <br />
            Below are approximations for how effective each material is at boosting this industry's production
            multiplier (Bigger bars = more effective):
            <br />
            <br />
            Hardware:&nbsp;&nbsp;&nbsp; {convertEffectFacToGraphic(division.hardwareFactor)}
            <br />
            Robots:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {convertEffectFacToGraphic(division.robotFactor)}
            <br />
            AI Cores:&nbsp;&nbsp;&nbsp; {convertEffectFacToGraphic(division.aiCoreFactor)}
            <br />
            Real Estate: {convertEffectFacToGraphic(division.realEstateFactor)}
          </Typography>
        </StaticModal>
      </Box>
      <Box display="flex" alignItems="center">
        <Tooltip title={"Scientific Research increases the quality of the materials and products that you produce."}>
          <Typography>Scientific Research: {formatBigNumber(division.researchPoints)}</Typography>
        </Tooltip>
        <Button sx={{ mx: 1 }} onClick={() => setResearchOpen(true)}>
          Research
        </Button>
        <ResearchModal open={researchOpen} onClose={() => setResearchOpen(false)} industry={division} />
      </Box>
      <br />
      <Box display="flex" alignItems="center">
        <ButtonWithTooltip
          normalTooltip={
            <>
              Hire <b>AdVert.Inc</b> to advertise your company. Each level of this upgrade grants your company a static
              increase of 3 and 1 to its awareness and popularity, respectively. It will then increase your company's
              awareness by 0.5%, and its popularity by a random percentage between 0.5% and 1.5%. These effects are
              increased by other upgrades that increase the power of your advertising.
            </>
          }
          disabledTooltip={division.getAdVertCost() > corp.funds ? "Insufficient corporation funds" : ""}
          onClick={() => {
            hireAdVert(corp, division);
            props.rerender();
          }}
        >
          Hire AdVert -&nbsp; <MoneyCost money={division.getAdVertCost()} corp={corp} />
        </ButtonWithTooltip>
        {division.makesProducts && <MakeProductButton />}
      </Box>
    </Paper>
  );
}
