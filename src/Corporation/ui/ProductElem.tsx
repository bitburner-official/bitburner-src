import React, { useState } from "react";
import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import { CityName, CorpUnlockName } from "@enums";
import * as corpConstants from "../data/Constants";
import { Product } from "../Product";
import { DiscontinueProductModal } from "./modals/DiscontinueProductModal";
import { LimitProductProductionModal } from "./modals/LimitProductProductionModal";
import { SellProductModal } from "./modals/SellProductModal";
import { CancelProductModal } from "./modals/CancelProductModal";

import { formatBigNumber, formatPercent } from "../../ui/formatNumber";

import { Money } from "../../ui/React/Money";
import { useCorporation, useDivision } from "./Context";
import { StatsTable } from "../../ui/React/StatsTable";

interface IProductProps {
  city: CityName;
  product: Product;
  rerender: () => void;
}

// Creates the UI for a single Product type
export function ProductElem(props: IProductProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [sellOpen, setSellOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [discontinueOpen, setDiscontinueOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const city = props.city;
  const product = props.product;
  const cityData = product.cityData[city];
  const hasUpgradeDashboard = division.hasResearch("uPgrade: Dashboard");

  // Total product gain = production - sale
  const totalGain = cityData.productionAmount - cityData.actualSellAmount;

  // Sell button
  let sellButtonText: JSX.Element;
  const desiredSellAmount = cityData.desiredSellAmount;
  if (desiredSellAmount !== null) {
    if (typeof desiredSellAmount === "string") {
      sellButtonText = (
        <>
          出售（{formatBigNumber(cityData.actualSellAmount)}/{desiredSellAmount}）
        </>
      );
    } else {
      sellButtonText = (
        <>
          出售（{formatBigNumber(cityData.actualSellAmount)}/{formatBigNumber(desiredSellAmount)}）
        </>
      );
    }
  } else {
    sellButtonText = <>出售（0.000/0.000）</>;
  }

  sellButtonText = (
    <>
      {sellButtonText} @ <Money money={product.uiMarketPrice[city]} />
    </>
  );
  // Limit Production button
  const productionLimit = cityData.productionLimit;
  const limitProductionButtonText =
    "限制产量" + (productionLimit !== null ? " (" + formatBigNumber(productionLimit) + ")" : "");

  return (
    <Paper>
      {!product.finished ? (
        <>
          <Typography>
            正在设计 {product.name}（需要 {product.creationCity} 的运营/工程员工）……
          </Typography>
          <br />
          <Typography>已完成 {formatPercent(product.developmentProgress / 100, 2)}</Typography>
          <Button onClick={() => setCancelOpen(true)}>取消</Button>
          <CancelProductModal
            product={product}
            rerender={props.rerender}
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
          />
        </>
      ) : (
        <>
          <Box display="flex">
            <Tooltip
              title={
                <StatsTable
                  rows={[
                    ["生产：", formatBigNumber(cityData.productionAmount)],
                    ["出售：", formatBigNumber(-cityData.actualSellAmount || 0)],
                  ]}
                />
              }
            >
              <Typography>
                {product.name}: {formatBigNumber(cityData.stored)} ({formatBigNumber(totalGain)}
                /s)
              </Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip
              title={
                <Typography>
                  有效评级由产品评级与所用材料的质量计算得出 <br />
                  评级：{formatBigNumber(product.rating)} <br /> <br />
                  质量：{formatBigNumber(product.stats.quality)} <br />
                  性能：{formatBigNumber(product.stats.performance)} <br />
                  耐久度：{formatBigNumber(product.stats.durability)} <br />
                  可靠性：{formatBigNumber(product.stats.reliability)} <br />
                  美观度：{formatBigNumber(product.stats.aesthetics)} <br />
                  功能性：{formatBigNumber(product.stats.features)}
                  {corp.unlocks.has(CorpUnlockName.MarketResearchDemand) && (
                    <>
                      <br />
                      {"需求：" + formatBigNumber(product.demand)}
                    </>
                  )}
                  {corp.unlocks.has(CorpUnlockName.MarketDataCompetition) && (
                    <>
                      <br />
                      {"竞争：" + formatBigNumber(product.competition)}
                    </>
                  )}
                </Typography>
              }
            >
              <Typography>有效评级：{formatBigNumber(cityData.effectiveRating)}</Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip title={<Typography>制造该产品所需材料成本的估计值。</Typography>}>
              <Typography>
                预计生产成本：<Money money={cityData.productionCost / corpConstants.baseProductProfitMult} />
              </Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip
              title={
                <Typography>
                  消费者愿意为该产品支付价格的估计值。售价高于此值可能导致销量下降；售价低于此值可能带来更多销量。
                </Typography>
              }
            >
              <Typography>
                预计市场价格：<Money money={cityData.productionCost} />
              </Typography>
            </Tooltip>
          </Box>
          <Button onClick={() => setDiscontinueOpen(true)}>停产</Button>
          <DiscontinueProductModal
            product={product}
            rerender={props.rerender}
            open={discontinueOpen}
            onClose={() => setDiscontinueOpen(false)}
          />
        </>
      )}

      {(hasUpgradeDashboard || product.finished) && (
        <>
          <Button onClick={() => setSellOpen(true)}>{sellButtonText}</Button>
          <SellProductModal
            key={`SellProductModal-${division.name}-${city}-${product.name}`}
            product={product}
            div={division}
            city={city}
            open={sellOpen}
            onClose={() => setSellOpen(false)}
          />
          <br />
          <Button onClick={() => setLimitOpen(true)}>{limitProductionButtonText}</Button>
          <LimitProductProductionModal
            product={product}
            city={city}
            open={limitOpen}
            onClose={() => setLimitOpen(false)}
          />
        </>
      )}
    </Paper>
  );
}
