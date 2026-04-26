// React Component for displaying an Industry's warehouse information
// (right-side panel in the Industry UI)
import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import * as corpConstants from "../data/Constants";
import { CityName, CorpUnlockName } from "@enums";
import { Warehouse } from "../Warehouse";
import { SmartSupplyModal } from "./modals/SmartSupplyModal";
import { ProductElem } from "./ProductElem";
import { MaterialElem } from "./MaterialElem";
import { MaterialInfo } from "../MaterialInfo";
import { createProgressBarText } from "../../utils/helpers/createProgressBarText";
import { formatBigNumber, formatMaterialSize, formatNumber } from "../../ui/formatNumber";

import { Corporation } from "../Corporation";
import { Division } from "../Division";
import { MoneyCost } from "./MoneyCost";
import { isRelevantMaterial } from "./Helpers";
import { IndustryProductEquation } from "./IndustryProductEquation";
import { purchaseWarehouse } from "../Actions";
import { useCorporation, useDivision } from "./Context";
import { gameCyclesPerCorpStateCycle } from "../data/Constants";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { StatsTable } from "../../ui/React/StatsTable";

interface WarehouseProps {
  corp: Corporation;
  division: Division;
  warehouse?: Warehouse;
  currentCity: CityName;
  rerender: () => void;
}

const useStyles = makeStyles()(() => ({
  retainHeight: {
    minHeight: "3em",
  },
}));

function WarehouseRoot(props: WarehouseProps): React.ReactElement {
  const { classes } = useStyles();
  const corp = useCorporation();
  const division = useDivision();
  const [smartSupplyOpen, setSmartSupplyOpen] = useState(false);
  if (!props.warehouse) return <></>;

  // Upgrade Warehouse size button
  const sizeUpgradeCost = corpConstants.warehouseSizeUpgradeCostBase * Math.pow(1.07, props.warehouse.level + 1);
  const canAffordUpgrade = corp.funds > sizeUpgradeCost;
  function upgradeWarehouseOnClick(): void {
    if (!props.warehouse) return;
    if (!canAffordUpgrade) return;
    ++props.warehouse.level;
    props.warehouse.updateSize(corp, division);
    corp.loseFunds(sizeUpgradeCost, "warehouse");
    props.rerender();
  }
  // -1 because as soon as it hits "full" it processes and resets to 0, *2 to double the size of the bar
  const ticks = (gameCyclesPerCorpStateCycle - 1) * 2;
  const nextState = corp.state.nextName;
  const prevState = corp.state.prevName.padStart(11);
  const stateBar = createProgressBarText({
    progress: Math.min(corp.storedCycles * 2, ticks) / ticks,
    totalTicks: ticks,
  });

  // Create React components for materials
  const mats = [];
  for (const matName of Object.values(corpConstants.materialNames)) {
    if (!props.warehouse.materials[matName]) continue;
    // Only create UI for materials that are relevant for the industry or in stock
    const isInStock = props.warehouse.materials[matName].stored > 0;
    const isRelevant = isRelevantMaterial(matName, division);
    if (!isInStock && !isRelevant) continue;
    mats.push(
      <MaterialElem
        rerender={props.rerender}
        city={props.currentCity}
        key={matName}
        mat={props.warehouse.materials[matName]}
        warehouse={props.warehouse}
      />,
    );
  }

  // Create React components for products
  const productElements = [];
  if (division.makesProducts && division.products.size > 0) {
    for (const [productName, product] of division.products) {
      productElements.push(
        <ProductElem rerender={props.rerender} city={props.currentCity} key={productName} product={product} />,
      );
    }
  }

  const breakdownItems: string[][] = [];
  for (const matName of corpConstants.materialNames) {
    const mat = props.warehouse.materials[matName];
    if (mat.stored === 0) continue;
    breakdownItems.push([
      `${matName}:`,
      `${formatMaterialSize(MaterialInfo[matName].size)}`,
      `${formatNumber(mat.stored)}`,
      `${formatMaterialSize(mat.stored * MaterialInfo[matName].size)}`,
    ]);
  }

  for (const [prodName, product] of division.products) {
    breakdownItems.push([
      `${prodName}:`,
      `${formatMaterialSize(product.size)}`,
      `${formatNumber(product.cityData[props.currentCity].stored)}`,
      `${formatMaterialSize(product.cityData[props.currentCity].stored * product.size)}`,
    ]);
  }

  if (breakdownItems.length > 0) {
    breakdownItems.unshift(["", "Size", "Units", "Total Space"]);
  }

  const breakdown =
    breakdownItems.length > 0 ? <StatsTable rows={breakdownItems} paddingLeft="1em" /> : <>No items in storage.</>;

  return (
    <Paper>
      <Box display="flex" alignItems="center">
        <Tooltip title={breakdown}>
          <Typography color={props.warehouse.sizeUsed >= props.warehouse.size ? "error" : "primary"}>
            Storage space: {formatBigNumber(props.warehouse.sizeUsed)} / {formatBigNumber(props.warehouse.size)}
          </Typography>
        </Tooltip>
      </Box>

      <ButtonWithTooltip
        disabledTooltip={canAffordUpgrade ? "" : "Insufficient corporation funds"}
        onClick={upgradeWarehouseOnClick}
      >
        Upgrade Warehouse Size -&nbsp;
        <MoneyCost money={sizeUpgradeCost} corp={corp} />
      </ButtonWithTooltip>

      <Typography>This industry uses the following equation for its production: </Typography>
      <br />
      <Typography>
        <IndustryProductEquation key={division.name} division={division} />
      </Typography>
      <br />
      <Typography>
        To get started with production, purchase your required materials or import them from another of your company's
        divisions.
      </Typography>
      <br />
      <Typography style={{ whiteSpace: "pre-wrap" }} className={classes.retainHeight}>
        {prevState} {stateBar} {nextState}
      </Typography>
      {corp.unlocks.has(CorpUnlockName.SmartSupply) && (
        <>
          <Button onClick={() => setSmartSupplyOpen(true)}>Configure Smart Supply</Button>
          <SmartSupplyModal
            open={smartSupplyOpen}
            onClose={() => setSmartSupplyOpen(false)}
            warehouse={props.warehouse}
          />
        </>
      )}

      {mats}

      {productElements}
    </Paper>
  );
}

export function DivisionWarehouse(props: WarehouseProps): React.ReactElement {
  if (props.warehouse) {
    return <WarehouseRoot {...props} />;
  } else {
    return <EmptyWarehouse rerender={props.rerender} city={props.currentCity} />;
  }
}

interface IEmptyProps {
  city: CityName;
  rerender: () => void;
}

function EmptyWarehouse(props: IEmptyProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const disabledText = corp.funds < corpConstants.warehouseInitialCost ? "Insufficient corporation funds" : "";
  function newWarehouse(): void {
    if (disabledText) return;
    purchaseWarehouse(corp, division, props.city);
    props.rerender();
  }
  return (
    <Paper>
      <ButtonWithTooltip onClick={newWarehouse} disabledTooltip={disabledText}>
        Purchase Warehouse (
        <MoneyCost money={corpConstants.warehouseInitialCost} corp={corp} />)
      </ButtonWithTooltip>
    </Paper>
  );
}
