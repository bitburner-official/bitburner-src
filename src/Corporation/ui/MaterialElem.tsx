// React Component for displaying an Industry's warehouse information
// (right-side panel in the Industry UI)
import React, { useState } from "react";
import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import { CityName, CorpUnlockName } from "@enums";
import { Material } from "../Material";
import { Warehouse } from "../Warehouse";
import { ExportModal } from "./modals/ExportModal";
import { SellMaterialModal } from "./modals/SellMaterialModal";
import { PurchaseMaterialModal } from "./modals/PurchaseMaterialModal";
import { formatBigNumber, formatCorpStat, formatQuality } from "../../ui/formatNumber";
import { Money } from "../../ui/React/Money";
import { useCorporation, useDivision } from "./Context";
import { LimitMaterialProductionModal } from "./modals/LimitMaterialProductionModal";
import { StatsTable } from "../../ui/React/StatsTable";

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
  const [limitProductionOpen, setLimitProductionOpen] = useState(false);

  const warehouse = props.warehouse;
  const city = props.city;
  const mat = props.mat;
  const office = division.offices[city];
  if (!office) {
    throw new Error(`Could not get OfficeSpace object for this city (${city})`);
  }

  // Total gain or loss of this material (per second)
  const totalGain =
    mat.buyAmount + mat.productionAmount + mat.importAmount - mat.actualSellAmount - mat.exportedLastCycle;

  // Flag that determines whether this industry is "new" and the current material should be
  // marked with flashing-red lights
  const tutorial =
    division.newInd && mat.name in division.requiredMaterials && mat.buyAmount === 0 && mat.importAmount === 0;

  // Purchase material button
  const purchaseButtonText = `Buy (${formatBigNumber(mat.buyAmount)})`;

  // Sell material button
  let sellButtonText: JSX.Element;
  if (mat.desiredSellAmount) {
    if (typeof mat.desiredSellAmount === "string") {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(mat.actualSellAmount)}/{mat.desiredSellAmount})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({formatBigNumber(mat.actualSellAmount)}/{formatBigNumber(mat.desiredSellAmount)})
        </>
      );
    }
    <>
      {sellButtonText} @ <Money money={mat.uiMarketPrice} />
    </>;
  } else {
    sellButtonText = <>Sell (0.000/0.000)</>;
  }

  // Limit Production button
  let limitMaterialButtonText = "Limit Material";
  if (mat.productionLimit !== null) {
    limitMaterialButtonText += " (" + formatCorpStat(mat.productionLimit) + ")";
  }

  // Material Gain details
  const gainBreakdown = [
    ["Buy:", mat.buyAmount >= 1e33 ? mat.buyAmount.toExponential(3) : formatBigNumber(mat.buyAmount)],
    ["Prod:", formatBigNumber(mat.productionAmount)],
    ["Import:", formatBigNumber(mat.importAmount)],
    ["Export:", formatBigNumber(-mat.exportedLastCycle || 0)],
    ["Sell:", formatBigNumber(-mat.actualSellAmount || 0)],
  ];
  if (corp.unlocks.has(CorpUnlockName.MarketResearchDemand)) {
    gainBreakdown.push(["Demand:", formatCorpStat(mat.demand)]);
  }
  if (corp.unlocks.has(CorpUnlockName.MarketDataCompetition)) {
    gainBreakdown.push(["Competition:", formatCorpStat(mat.competition)]);
  }

  return (
    <Paper>
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", m: "5px" }}>
        <Box>
          <Tooltip title={<StatsTable rows={gainBreakdown} />}>
            <Typography>
              {mat.name}: {formatBigNumber(mat.stored)} (
              {totalGain >= 1e33 ? totalGain.toExponential(3) : formatBigNumber(totalGain)}/s)
            </Typography>
          </Tooltip>
          <Tooltip
            title={
              <Typography>
                Market Price: The price you would pay if you were to buy this material on the market
              </Typography>
            }
          >
            <Typography>
              MP: <Money money={mat.marketPrice} />
            </Typography>
          </Tooltip>
          <Tooltip
            title={<Typography>The quality of your material. Higher quality will lead to more sales</Typography>}
          >
            <Typography>Quality: {formatQuality(mat.quality)}</Typography>
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
            disablePurchaseLimit={props.warehouse.smartSupplyEnabled && props.mat.name in division.requiredMaterials}
            onClose={() => setPurchaseMaterialOpen(false)}
          />

          {corp.unlocks.has(CorpUnlockName.Export) && (
            <>
              <Button onClick={() => setExportOpen(true)}>Export</Button>

              <ExportModal mat={mat} open={exportOpen} onClose={() => setExportOpen(false)} />
            </>
          )}

          <Button
            color={division.producedMaterials.includes(props.mat.name) && !mat.desiredSellAmount ? "error" : "primary"}
            onClick={() => setSellMaterialOpen(true)}
          >
            {sellButtonText}
          </Button>
          <SellMaterialModal
            mat={mat}
            div={division}
            open={sellMaterialOpen}
            onClose={() => setSellMaterialOpen(false)}
          />
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
