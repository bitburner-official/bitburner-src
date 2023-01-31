// React Component for displaying an Industry's warehouse information
// (right-side panel in the Industry UI)
import React, { useState } from "react";

import { Material } from "../Material";
import { Warehouse } from "../Warehouse";
import { ExportModal } from "./modals/ExportModal";
import { MaterialMarketTaModal } from "./modals/MaterialMarketTaModal";
import { SellMaterialModal } from "./modals/SellMaterialModal";
import { PurchaseMaterialModal } from "./modals/PurchaseMaterialModal";

import { formatMoney, nFormat } from "../../ui/nFormat";

import { isString } from "../../utils/helpers/isString";
import { Money } from "../../ui/React/Money";
import { useCorporation, useDivision } from "./Context";

import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { LimitMaterialProductionModal } from "./modals/LimitMaterialProductionModal";
import { CityName } from "../../Enums";

interface IMaterialProps {
  warehouse: Warehouse;
  city: CityName;
  mat: Material;
  rerender: () => void;
}

// Creates the UI for a single Material type
export function MaterialElem(props: IMaterialProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [purchaseMaterialOpen, setPurchaseMaterialOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sellMaterialOpen, setSellMaterialOpen] = useState(false);
  const [materialMarketTaOpen, setMaterialMarketTaOpen] = useState(false);
  const [limitProductionOpen, setLimitProductionOpen] = useState(false);

  const warehouse = props.warehouse;
  const city = props.city;
  const mat = props.mat;
  const markupLimit = mat.getMarkupLimit();
  const office = division.offices[city];
  if (!office) {
    throw new Error(`Could not get OfficeSpace object for this city (${city})`);
  }

  // Numeral.js formatter
  const nf = "0.000";
  const nfB = "0.000a"; // For numbers that might be bigger

  // Total gain or loss of this material (per second)
  const totalGain = mat.buy + mat.prd + mat.imp - mat.sll - mat.totalExp;

  // Flag that determines whether this industry is "new" and the current material should be
  // marked with flashing-red lights
  const tutorial =
    division.newInd && Object.keys(division.reqMats).includes(mat.name) && mat.buy === 0 && mat.imp === 0;

  // Purchase material button
  const purchaseButtonText = `Buy (${mat.buy >= 1e33 ? mat.buy.toExponential(3) : nFormat(mat.buy, nfB)})`;

  // Sell material button
  let sellButtonText: JSX.Element;
  if (mat.sllman[0]) {
    if (isString(mat.sllman[1])) {
      sellButtonText = (
        <>
          Sell ({nFormat(mat.sll, nfB)}/{mat.sllman[1]})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({nFormat(mat.sll, nfB)}/{nFormat(mat.sllman[1] as number, nfB)})
        </>
      );
    }

    if (mat.marketTa2) {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={mat.marketTa2Price} />
        </>
      );
    } else if (mat.marketTa1) {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={mat.bCost + markupLimit} />
        </>
      );
    } else if (mat.sCost) {
      if (isString(mat.sCost)) {
        const sCost = (mat.sCost as string).replace(/MP/g, mat.bCost + "");
        sellButtonText = (
          <>
            {sellButtonText} @ <Money money={eval(sCost)} />
          </>
        );
      } else {
        sellButtonText = (
          <>
            {sellButtonText} @ <Money money={mat.sCost} />
          </>
        );
      }
    }
  } else {
    sellButtonText = <>Sell (0.000/0.000)</>;
  }

  // Limit Production button
  let limitMaterialButtonText = "Limit Material";
  if (mat.prdman[0]) {
    limitMaterialButtonText += " (" + nFormat(mat.prdman[1], nf) + ")";
  }

  return (
    <Paper>
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", m: "5px" }}>
        <Box>
          <Tooltip
            title={
              <Typography>
                Buy: {mat.buy >= 1e33 ? mat.buy.toExponential(3) : nFormat(mat.buy, nfB)} <br />
                Prod: {nFormat(mat.prd, nfB)} <br />
                Sell: {nFormat(mat.sll, nfB)} <br />
                Export: {nFormat(mat.totalExp, nfB)} <br />
                Import: {nFormat(mat.imp, nfB)}
                {corp.unlockUpgrades[2] === 1 && <br />}
                {corp.unlockUpgrades[2] === 1 && "Demand: " + nFormat(mat.dmd, nf)}
                {corp.unlockUpgrades[3] === 1 && <br />}
                {corp.unlockUpgrades[3] === 1 && "Competition: " + nFormat(mat.cmp, nf)}
              </Typography>
            }
          >
            <Typography>
              {mat.name}: {nFormat(mat.qty, nfB)} (
              {totalGain >= 1e33 ? totalGain.toExponential(3) : nFormat(totalGain, nfB)}/s)
            </Typography>
          </Tooltip>
          <Tooltip
            title={
              <Typography>
                Market Price: The price you would pay if you were to buy this material on the market
              </Typography>
            }
          >
            <Typography>MP: {formatMoney(mat.bCost)}</Typography>
          </Tooltip>
          <Tooltip
            title={<Typography>The quality of your material. Higher quality will lead to more sales</Typography>}
          >
            <Typography>Quality: {nFormat(mat.qlt, "0.00a")}</Typography>
          </Tooltip>
        </Box>

        <Box sx={{ "& button": { width: "100%" } }}>
          <Tooltip
            title={tutorial ? <Typography>Purchase your required materials to get production started!</Typography> : ""}
          >
            <Button color={tutorial ? "error" : "primary"} onClick={() => setPurchaseMaterialOpen(true)}>
              {purchaseButtonText}
            </Button>
          </Tooltip>
          <PurchaseMaterialModal
            mat={mat}
            warehouse={warehouse}
            open={purchaseMaterialOpen}
            disablePurchaseLimit={
              props.warehouse.smartSupplyEnabled && Object.keys(division.reqMats).includes(props.mat.name)
            }
            onClose={() => setPurchaseMaterialOpen(false)}
          />

          {corp.unlockUpgrades[0] === 1 && (
            <>
              <Button onClick={() => setExportOpen(true)}>Export</Button>

              <ExportModal mat={mat} open={exportOpen} onClose={() => setExportOpen(false)} />
            </>
          )}

          <Button
            color={division.prodMats.includes(props.mat.name) && !mat.sllman[0] ? "error" : "primary"}
            onClick={() => setSellMaterialOpen(true)}
          >
            {sellButtonText}
          </Button>
          <SellMaterialModal mat={mat} open={sellMaterialOpen} onClose={() => setSellMaterialOpen(false)} />
          {division.hasResearch("Market-TA.I") && (
            <>
              <Button onClick={() => setMaterialMarketTaOpen(true)}>Market-TA</Button>

              <MaterialMarketTaModal
                mat={mat}
                open={materialMarketTaOpen}
                onClose={() => setMaterialMarketTaOpen(false)}
              />
            </>
          )}
          <Button color={tutorial ? "error" : "primary"} onClick={() => setLimitProductionOpen(true)}>
            {limitMaterialButtonText}
          </Button>
          <LimitMaterialProductionModal
            material={mat}
            open={limitProductionOpen}
            onClose={() => setLimitProductionOpen(false)}
          />
        </Box>
      </Box>
    </Paper>
  );
}
