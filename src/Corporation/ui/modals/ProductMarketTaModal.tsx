import React, { useState } from "react";
import { formatMoney } from "../../../ui/formatNumber";
import { Product } from "../../Product";
import { Modal } from "../../../ui/React/Modal";
import { useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useRerender } from "../../../ui/React/hooks";

interface ITa2Props {
  product: Product;
}

function MarketTA2(props: ITa2Props): React.ReactElement {
  const division = useDivision();
  if (!division.hasResearch("Market-TA.II")) return <></>;
  const rerender = useRerender();

  function onCheckedChange(event: React.ChangeEvent<HTMLInputElement>): void {
    props.product.marketTa2 = event.target.checked;
    rerender();
  }

  return (
    <>
      <Typography variant="h4">Market-TA.II</Typography>
      <br />
      <Typography>
        If this is enabled, then this product will automatically be sold at the optimal price such that the amount sold
        matches the amount produced. (i.e. the highest possible price, while still ensuring that all produced materials
        will be sold)
      </Typography>
      <br />
      <FormControlLabel
        control={<Switch checked={props.product.marketTa2} onChange={onCheckedChange} />}
        label={<Typography>Use Market-TA.II for Auto-Sale Price</Typography>}
      />
    </>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

// Create a popup that lets the player use the Market TA research for Products
export function ProductMarketTaModal(props: IProps): React.ReactElement {
  const markupLimit = props.product.rat / props.product.mku;
  const setRerender = useState(false)[1];
  function rerender(): void {
    setRerender((old) => !old);
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    props.product.marketTa1 = event.target.checked;
    rerender();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography variant="h4">Market-TA.I</Typography>
        <Typography>
          The maximum sale price you can mark this up to is {formatMoney(props.product.pCost + markupLimit)}. This means
          that if you set the sale price higher than this, you will begin to experience a loss in number of sales
          <br></br>
          <br></br>
          If this is enabled, then this product will automatically be sold at the price identified by Market-TA.I (i.e.
          the price shown above)
        </Typography>

        <FormControlLabel
          control={<Switch checked={props.product.marketTa1} onChange={onChange} />}
          label={<Typography>Use Market-TA.I for Auto-Sale Price</Typography>}
        />
      </>

      <MarketTA2 product={props.product} />
    </Modal>
  );
}
