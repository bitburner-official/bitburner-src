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
  isOutputMaterial: boolean;
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
  const purchaseButtonText = `购买（${formatBigNumber(mat.buyAmount)}）`;

  // Sell material button
  let sellButtonText: JSX.Element;
  if (mat.desiredSellAmount) {
    if (typeof mat.desiredSellAmount === "string") {
      sellButtonText = (
        <>
          出售（{formatBigNumber(mat.actualSellAmount)}/{mat.desiredSellAmount}）
        </>
      );
    } else {
      sellButtonText = (
        <>
          出售（{formatBigNumber(mat.actualSellAmount)}/{formatBigNumber(mat.desiredSellAmount)}）
        </>
      );
    }
    <>
      {sellButtonText} @ <Money money={mat.uiMarketPrice} />
    </>;
  } else {
    sellButtonText = <>出售（0.000/0.000）</>;
  }

  // Limit Production button
  let limitMaterialButtonText = "限制材料产量";
  if (mat.productionLimit !== null) {
    limitMaterialButtonText += " (" + formatCorpStat(mat.productionLimit) + ")";
  }

  // Material Gain details
  const gainBreakdown = [
    ["购买：", mat.buyAmount >= 1e33 ? mat.buyAmount.toExponential(3) : formatBigNumber(mat.buyAmount)],
    ["生产：", formatBigNumber(mat.productionAmount)],
    ["进口：", formatBigNumber(mat.importAmount)],
    ["出口：", formatBigNumber(-mat.exportedLastCycle || 0)],
    ["出售：", formatBigNumber(-mat.actualSellAmount || 0)],
  ];
  if (corp.unlocks.has(CorpUnlockName.MarketResearchDemand)) {
    gainBreakdown.push(["需求：", formatCorpStat(mat.demand)]);
  }
  if (corp.unlocks.has(CorpUnlockName.MarketDataCompetition)) {
    gainBreakdown.push(["竞争：", formatCorpStat(mat.competition)]);
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
                市场价格：如果你在市场上购买这种材料，需要支付的价格
              </Typography>
            }
          >
            <Typography>
              市价（MP）：<Money money={mat.marketPrice} />
            </Typography>
          </Tooltip>
          <Tooltip
            title={<Typography>你的材料质量。质量越高销量越大</Typography>}
          >
            <Typography>质量：{formatQuality(mat.quality)}</Typography>
          </Tooltip>
        </Box>

        <Box sx={{ "& button": { width: "100%" } }}>
          <Tooltip
            title={tutorial ? <Typography>购买所需材料，开始生产吧！</Typography> : ""}
          >
            <Button color={tutorial ? "error" : "primary"} onClick={() => setPurchaseMaterialOpen(true)}>
              {purchaseButtonText}
            </Button>
          </Tooltip>
          <PurchaseMaterialModal
            key={`PurchaseMaterialModal-${division.name}-${city}-${mat.name}`}
            mat={mat}
            warehouse={warehouse}
            open={purchaseMaterialOpen}
            disablePurchaseLimit={props.warehouse.smartSupplyEnabled && props.mat.name in division.requiredMaterials}
            onClose={() => setPurchaseMaterialOpen(false)}
          />

          {corp.unlocks.has(CorpUnlockName.Export) && (
            <>
              <Button onClick={() => setExportOpen(true)}>出口</Button>

              <ExportModal
                key={`ExportModal-${division.name}-${city}-${mat.name}`}
                mat={mat}
                open={exportOpen}
                onClose={() => setExportOpen(false)}
              />
            </>
          )}

          <Button
            color={division.producedMaterials.includes(props.mat.name) && !mat.desiredSellAmount ? "error" : "primary"}
            onClick={() => setSellMaterialOpen(true)}
          >
            {sellButtonText}
          </Button>
          <SellMaterialModal
            key={`SellMaterialModal-${division.name}-${city}-${mat.name}`}
            mat={mat}
            div={division}
            open={sellMaterialOpen}
            onClose={() => setSellMaterialOpen(false)}
          />
          {props.isOutputMaterial && (
            <>
              <Button color={tutorial ? "error" : "primary"} onClick={() => setLimitProductionOpen(true)}>
                {limitMaterialButtonText}
              </Button>
              <LimitMaterialProductionModal
                material={mat}
                open={limitProductionOpen}
                onClose={() => setLimitProductionOpen(false)}
              />
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
