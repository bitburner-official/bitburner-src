// React Component for displaying an Industry's warehouse information
// (right-side panel in the Industry UI)
import React, { useState } from "react";

import * as corpConstants from "../data/Constants";
import { Warehouse } from "../Warehouse";
import { SmartSupplyModal } from "./modals/SmartSupplyModal";
import { ProductElem } from "./ProductElem";
import { MaterialElem } from "./MaterialElem";
import { MaterialInfo } from "../MaterialInfo";

import { formatBigNumber, formatMaterialSize } from "../../ui/formatNumber";

import { Corporation } from "../Corporation";
import { Division } from "../Division";
import { MoneyCost } from "./MoneyCost";
import { isRelevantMaterial } from "./Helpers";
import { IndustryProductEquation } from "./IndustryProductEquation";
import { purchaseWarehouse } from "../Actions";
import { useCorporation, useDivision } from "./Context";

import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import { CityName } from "../../Enums";
import { CorpUnlockName } from "../data/Enums";

interface IProps {
  corp: Corporation;
  division: Division;
  warehouse?: Warehouse;
  currentCity: CityName;
  rerender: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    retainHeight: {
      minHeight: "3em",
    },
  }),
);

function WarehouseRoot(props: IProps): React.ReactElement {
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
    corp.funds = corp.funds - sizeUpgradeCost;
    props.rerender();
  }

  const classes = useStyles();

  // Current State:
  let stateText;
  switch (division.state) {
    case "START":
      stateText = "Current state: Preparing...";
      break;
    case "PURCHASE":
      stateText = "Current state: Purchasing materials...";
      break;
    case "PRODUCTION":
      stateText = "Current state: Producing materials and/or products...";
      break;
    case "SALE":
      stateText = "Current state: Selling materials and/or products...";
      break;
    case "EXPORT":
      stateText = "Current state: Exporting materials and/or products...";
      break;
    default:
      console.error(`Invalid state: ${division.state}`);
      break;
  }

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

  const breakdownItems: string[] = [];
  for (const matName of corpConstants.materialNames) {
    const mat = props.warehouse.materials[matName];
    if (mat.stored === 0) continue;
    breakdownItems.push(`${matName}: ${formatMaterialSize(mat.stored * MaterialInfo[matName].size)}`);
  }

  for (const [prodName, product] of division.products) {
    breakdownItems.push(
      `${prodName}: ${formatMaterialSize(product.cityData[props.currentCity].stored * product.size)}`,
    );
  }

  let breakdown;
  if (breakdownItems.length > 0) {
    breakdown = breakdownItems.reduce(
      (previous: JSX.Element, current: string): JSX.Element => (
        <>
          {previous}
          <br />
          {current}
        </>
      ),
      <></>,
    );
  } else {
    breakdown = <>No items in storage.</>;
  }

  return (
    <Paper>
      <Box display="flex" alignItems="center">
        <Tooltip
          title={
            props.warehouse.sizeUsed !== 0 ? (
              <Typography>
                <>{breakdown}</>
              </Typography>
            ) : (
              ""
            )
          }
        >
          <Typography color={props.warehouse.sizeUsed >= props.warehouse.size ? "error" : "primary"}>
            Storage: {formatBigNumber(props.warehouse.sizeUsed)} / {formatBigNumber(props.warehouse.size)}
          </Typography>
        </Tooltip>
      </Box>

      <Button disabled={!canAffordUpgrade} onClick={upgradeWarehouseOnClick}>
        Upgrade Warehouse Size -&nbsp;
        <MoneyCost money={sizeUpgradeCost} corp={corp} />
      </Button>

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

      <Typography className={classes.retainHeight}>{stateText}</Typography>

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

export function IndustryWarehouse(props: IProps): React.ReactElement {
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
  const disabled = corp.funds < corpConstants.warehouseInitialCost;
  function newWarehouse(): void {
    if (disabled) return;
    purchaseWarehouse(corp, division, props.city);
    props.rerender();
  }
  return (
    <Paper>
      <Button onClick={newWarehouse} disabled={disabled}>
        Purchase Warehouse (
        <MoneyCost money={corpConstants.warehouseInitialCost} corp={corp} />)
      </Button>
    </Paper>
  );
}
