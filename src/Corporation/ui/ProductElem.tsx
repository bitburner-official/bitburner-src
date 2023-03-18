import React, { useState } from "react";

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

interface IProductProps {
  city: string;
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
  const totalGain = product.data[city][1] - product.data[city][2];

  // Sell button
  let sellButtonText: JSX.Element;
  if (product.sllman[city][0]) {
    if (isString(product.sllman[city][1])) {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(product.data[city][2])}/{product.sllman[city][1]})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(product.data[city][2])}/{formatBigNumber(product.sllman[city][1])})
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
    const markupLimit = product.rat / product.mku;
    sellButtonText = (
      <>
        {sellButtonText} @ <Money money={product.pCost + markupLimit} />
      </>
    );
  } else if (product.sCost[city]) {
    if (isString(product.sCost[city])) {
      const sCost = (product.sCost[city] as string).replace(/MP/g, product.pCost + product.rat / product.mku + "");
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={eval(sCost)} />
        </>
      );
    } else {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={product.sCost[city]} />
        </>
      );
    }
  }

  // Limit Production button
  let limitProductionButtonText = "Limit Production";
  if (product.prdman[city][0]) {
    limitProductionButtonText += " (" + formatCorpStat(product.prdman[city][1]) + ")";
  }

  return (
    <Paper>
      {!product.fin ? (
        <>
          <Typography>
            Designing {product.name} (req. Operations/Engineers in {product.createCity})...
          </Typography>
          <br />
          <Typography>{formatPercent(product.prog / 100, 2)} complete</Typography>
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
                  Prod: {formatBigNumber(product.data[city][1])}/s
                  <br />
                  Sell: {formatBigNumber(product.data[city][2])} /s
                </Typography>
              }
            >
              <Typography>
                {product.name}: {formatBigNumber(product.data[city][0])} ({formatBigNumber(totalGain)}
                /s)
              </Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip
              title={
                <Typography>
                  Effective rating is calculated from product rating and the quality of materials used <br />
                  Rating: {formatCorpStat(product.rat)} <br /> <br />
                  Quality: {formatCorpStat(product.qlt)} <br />
                  Performance: {formatCorpStat(product.per)} <br />
                  Durability: {formatCorpStat(product.dur)} <br />
                  Reliability: {formatCorpStat(product.rel)} <br />
                  Aesthetics: {formatCorpStat(product.aes)} <br />
                  Features: {formatCorpStat(product.fea)}
                  {corp.unlockUpgrades[2] === 1 && <br />}
                  {corp.unlockUpgrades[2] === 1 && "Demand: " + formatCorpStat(product.dmd)}
                  {corp.unlockUpgrades[3] === 1 && <br />}
                  {corp.unlockUpgrades[3] === 1 && "Competition: " + formatCorpStat(product.cmp)}
                </Typography>
              }
            >
              <Typography>Effective rating: {formatCorpStat(product.data[city][3])}</Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip title={<Typography>An estimate of the material cost it takes to create this Product.</Typography>}>
              <Typography>
                Est. Production Cost: {formatMoney(product.pCost / corpConstants.baseProductProfitMult)}
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
              <Typography>Est. Market Price: {formatMoney(product.pCost)}</Typography>
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

      {(hasUpgradeDashboard || product.fin) && (
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
