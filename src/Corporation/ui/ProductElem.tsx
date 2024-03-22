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
          Sell ({formatBigNumber(cityData.actualSellAmount)}/{desiredSellAmount})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(cityData.actualSellAmount)}/{formatBigNumber(desiredSellAmount)})
        </>
      );
    }
  } else {
    sellButtonText = <>Sell (0.000/0.000)</>;
  }

  sellButtonText = (
    <>
      {sellButtonText} @ <Money money={product.uiMarketPrice[city]} />
    </>
  );
  // Limit Production button
  const productionLimit = cityData.productionLimit;
  const limitProductionButtonText =
    "Limit Production" + (productionLimit !== null ? " (" + formatBigNumber(productionLimit) + ")" : "");

  return (
    <Paper>
      {!product.finished ? (
        <>
          <Typography>
            Designing {product.name} (req. Operations/Engineers in {product.creationCity})...
          </Typography>
          <br />
          <Typography>{formatPercent(product.developmentProgress / 100, 2)} complete</Typography>
          <Button onClick={() => setCancelOpen(true)}>Cancel</Button>
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
                    ["Prod:", formatBigNumber(cityData.productionAmount)],
                    ["Sell:", formatBigNumber(-cityData.actualSellAmount || 0)],
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
                  Effective rating is calculated from product rating and the quality of materials used <br />
                  Rating: {formatBigNumber(product.rating)} <br /> <br />
                  Quality: {formatBigNumber(product.stats.quality)} <br />
                  Performance: {formatBigNumber(product.stats.performance)} <br />
                  Durability: {formatBigNumber(product.stats.durability)} <br />
                  Reliability: {formatBigNumber(product.stats.reliability)} <br />
                  Aesthetics: {formatBigNumber(product.stats.aesthetics)} <br />
                  Features: {formatBigNumber(product.stats.features)}
                  {corp.unlocks.has(CorpUnlockName.MarketResearchDemand) && (
                    <>
                      <br />
                      {"Demand: " + formatBigNumber(product.demand)}
                    </>
                  )}
                  {corp.unlocks.has(CorpUnlockName.MarketDataCompetition) && (
                    <>
                      <br />
                      {"Competition: " + formatBigNumber(product.competition)}
                    </>
                  )}
                </Typography>
              }
            >
              <Typography>Effective rating: {formatBigNumber(cityData.effectiveRating)}</Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip title={<Typography>An estimate of the material cost it takes to create this Product.</Typography>}>
              <Typography>
                Est. Production Cost: <Money money={cityData.productionCost / corpConstants.baseProductProfitMult} />
              </Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip
              title={
                <Typography>
                  An estimate of how much consumers are willing to pay for this product. Setting the sale price above
                  this may result in less sales. Setting the sale price below this may result in more sales.
                </Typography>
              }
            >
              <Typography>
                Est. Market Price: <Money money={cityData.productionCost} />
              </Typography>
            </Tooltip>
          </Box>
          <Button onClick={() => setDiscontinueOpen(true)}>Discontinue</Button>
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
