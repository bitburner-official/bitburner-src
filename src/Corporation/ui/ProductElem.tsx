import React, { useState } from "react";

import type { CityName } from "src/Enums";
import * as corpConstants from "../data/Constants";
import { Product } from "../Product";
import { DiscontinueProductModal } from "./modals/DiscontinueProductModal";
import { LimitProductProductionModal } from "./modals/LimitProductProductionModal";
import { SellProductModal } from "./modals/SellProductModal";
import { ProductMarketTaModal } from "./modals/ProductMarketTaModal";
import { CancelProductModal } from "./modals/CancelProductModal";

import { formatBigNumber, formatCorpStat, formatMoney, formatPercent } from "../../ui/formatNumber";

import { isString } from "../../utils/helpers/isString";
import { Money } from "../../ui/React/Money";
import { useCorporation, useDivision } from "./Context";

import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { CorpUnlockName } from "../data/Enums";

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
  const [marketTaOpen, setMarketTaOpen] = useState(false);
  const city = props.city;
  const product = props.product;

  const hasUpgradeDashboard = division.hasResearch("uPgrade: Dashboard");

  // Total product gain = production - sale
  const totalGain = product.data[city].productionAmount - product.data[city].actualSellAmount;

  // Sell button
  let sellButtonText: JSX.Element;
  const desiredSellAmount = product.desiredSellAmount[city];
  if (desiredSellAmount !== null) {
    if (isString(desiredSellAmount)) {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(product.data[city].actualSellAmount)}/{desiredSellAmount})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(product.data[city].actualSellAmount)}/{formatBigNumber(desiredSellAmount)})
        </>
      );
    }
  } else {
    sellButtonText = <>Sell (0.000/0.000)</>;
  }

  if (product.marketTa2) {
    sellButtonText = (
      <>
        {sellButtonText} @ <Money money={product.marketTa2Price[city]} />
      </>
    );
  } else if (product.marketTa1) {
    const markupLimit = product.overallRating / product.markup;
    sellButtonText = (
      <>
        {sellButtonText} @ <Money money={product.productionCost + markupLimit} />
      </>
    );
  } else if (product.sellPrices[city]) {
    if (isString(product.sellPrices[city])) {
      const sCost = (product.sellPrices[city] as string).replace(
        /MP/g,
        product.productionCost + product.overallRating / product.markup + "",
      );
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={eval(sCost)} />
        </>
      );
    } else {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={product.sellPrices[city]} />
        </>
      );
    }
  }

  // Limit Production button
  const productionLimit = product.productionLimit[city];
  const limitProductionButtonText =
    "Limit Production" + (productionLimit !== null ? " (" + formatCorpStat(productionLimit) + ")" : "");

  return (
    <Paper>
      {!product.finished ? (
        <>
          <Typography>
            Designing {product.name} (req. Operations/Engineers in {product.creationCity})...
          </Typography>
          <br />
          <Typography>{formatPercent(product.progress / 100, 2)} complete</Typography>
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
                <Typography>
                  Prod: {formatBigNumber(product.data[city].productionAmount)}/s
                  <br />
                  Sell: {formatBigNumber(product.data[city].actualSellAmount)} /s
                </Typography>
              }
            >
              <Typography>
                {product.name}: {formatBigNumber(product.data[city].inventory)} ({formatBigNumber(totalGain)}
                /s)
              </Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip
              title={
                <Typography>
                  Effective rating is calculated from product rating and the quality of materials used <br />
                  Rating: {formatCorpStat(product.overallRating)} <br /> <br />
                  Quality: {formatCorpStat(product.quality)} <br />
                  Performance: {formatCorpStat(product.performance)} <br />
                  Durability: {formatCorpStat(product.durability)} <br />
                  Reliability: {formatCorpStat(product.reliability)} <br />
                  Aesthetics: {formatCorpStat(product.aesthetics)} <br />
                  Features: {formatCorpStat(product.features)}
                  {corp.unlocks.has(CorpUnlockName.MarketResearchDemand) && (
                    <>
                      <br />
                      {"Demand: " + formatCorpStat(product.demand)}
                    </>
                  )}
                  {corp.unlocks.has(CorpUnlockName.MarketDataCompetition) && (
                    <>
                      <br />
                      {"Competition: " + formatCorpStat(product.competition)}
                    </>
                  )}
                </Typography>
              }
            >
              <Typography>Effective rating: {formatCorpStat(product.data[city].effectiveRating)}</Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip title={<Typography>An estimate of the material cost it takes to create this Product.</Typography>}>
              <Typography>
                Est. Production Cost: {formatMoney(product.productionCost / corpConstants.baseProductProfitMult)}
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
              <Typography>Est. Market Price: {formatMoney(product.productionCost)}</Typography>
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
          <SellProductModal product={product} city={city} open={sellOpen} onClose={() => setSellOpen(false)} />
          <br />
          <Button onClick={() => setLimitOpen(true)}>{limitProductionButtonText}</Button>
          <LimitProductProductionModal
            product={product}
            city={city}
            open={limitOpen}
            onClose={() => setLimitOpen(false)}
          />
          {division.hasResearch("Market-TA.I") && (
            <>
              <Button onClick={() => setMarketTaOpen(true)}>Market-TA</Button>
              <ProductMarketTaModal product={product} open={marketTaOpen} onClose={() => setMarketTaOpen(false)} />
            </>
          )}
        </>
      )}
    </Paper>
  );
}
