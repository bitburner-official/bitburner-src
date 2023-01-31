import React, { useState } from "react";

import * as corpConstants from "../data/Constants";
import { Product } from "../Product";
import { DiscontinueProductModal } from "./modals/DiscontinueProductModal";
import { LimitProductProductionModal } from "./modals/LimitProductProductionModal";
import { SellProductModal } from "./modals/SellProductModal";
import { ProductMarketTaModal } from "./modals/ProductMarketTaModal";
import { CancelProductModal } from "./modals/CancelProductModal";

import { formatMoney, nFormat } from "../../ui/nFormat";

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

  // Numeral.js formatters
  const nf = "0.000";
  const nfB = "0.000a"; // For numbers that might be big

  const hasUpgradeDashboard = division.hasResearch("uPgrade: Dashboard");

  // Total product gain = production - sale
  const totalGain = product.data[city][1] - product.data[city][2];

  // Sell button
  let sellButtonText: JSX.Element;
  if (product.sllman[city][0]) {
    if (isString(product.sllman[city][1])) {
      sellButtonText = (
        <>
          Sell ({nFormat(product.data[city][2], nfB)}/{product.sllman[city][1]})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({nFormat(product.data[city][2], nfB)}/{nFormat(product.sllman[city][1], nfB)})
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
  } else if (product.sCost) {
    if (isString(product.sCost)) {
      const sCost = (product.sCost as string).replace(/MP/g, product.pCost + product.rat / product.mku + "");
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={eval(sCost)} />
        </>
      );
    } else {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={product.sCost} />
        </>
      );
    }
  }

  // Limit Production button
  let limitProductionButtonText = "Limit Production";
  if (product.prdman[city][0]) {
    limitProductionButtonText += " (" + nFormat(product.prdman[city][1], nf) + ")";
  }

  return (
    <Paper>
      {!product.fin ? (
        <>
          <Typography>
            Designing {product.name} (req. Operations/Engineers in {product.createCity})...
          </Typography>
          <br />
          <Typography>{nFormat(product.prog, "0.00")}% complete</Typography>
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
                  Prod: {nFormat(product.data[city][1], nfB)}/s
                  <br />
                  Sell: {nFormat(product.data[city][2], nfB)} /s
                </Typography>
              }
            >
              <Typography>
                {product.name}: {nFormat(product.data[city][0], nfB)} ({nFormat(totalGain, nfB)}
                /s)
              </Typography>
            </Tooltip>
          </Box>
          <Box display="flex">
            <Tooltip
              title={
                <Typography>
                  Quality: {nFormat(product.qlt, nf)} <br />
                  Performance: {nFormat(product.per, nf)} <br />
                  Durability: {nFormat(product.dur, nf)} <br />
                  Reliability: {nFormat(product.rel, nf)} <br />
                  Aesthetics: {nFormat(product.aes, nf)} <br />
                  Features: {nFormat(product.fea, nf)}
                  {corp.unlockUpgrades[2] === 1 && <br />}
                  {corp.unlockUpgrades[2] === 1 && "Demand: " + nFormat(product.dmd, nf)}
                  {corp.unlockUpgrades[3] === 1 && <br />}
                  {corp.unlockUpgrades[3] === 1 && "Competition: " + nFormat(product.cmp, nf)}
                </Typography>
              }
            >
              <Typography>Rating: {nFormat(product.rat, nf)}</Typography>
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
