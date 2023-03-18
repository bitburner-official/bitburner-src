import React, { useState } from "react";
import { formatMoney } from "../../../ui/formatNumber";
import { Material } from "../../Material";
import { Modal } from "../../../ui/React/Modal";
import { useDivision } from "../Context";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useRerender } from "../../../ui/React/hooks";

interface IMarketTA2Props {
  mat: Material;
}

function MarketTA2(props: IMarketTA2Props): React.ReactElement {
  const division = useDivision();
  if (!division.hasResearch("Market-TA.II")) return <></>;
  const rerender = useRerender();

  function onMarketTA2(event: React.ChangeEvent<HTMLInputElement>): void {
    props.mat.marketTa2 = event.target.checked;
    rerender();
  }

  return (
    <>
      <Typography variant="h4">Market-TA.II</Typography>
      <Typography>
        If this is enabled, then this Material will automatically be sold at the optimal price such that the amount sold
        matches the amount produced. (i.e. the highest possible price, while still ensuring that all produced materials
        will be sold)
      </Typography>
      <br />
      <FormControlLabel
        control={<Switch checked={props.mat.marketTa2} onChange={onMarketTA2} />}
        label={<Typography>Use Market-TA.II for Auto-Sale Price</Typography>}
      />
    </>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  mat: Material;
}

// Create a popup that lets the player use the Market TA research for Materials
export function MaterialMarketTaModal(props: IProps): React.ReactElement {
  const setRerender = useState(false)[1];
  function rerender(): void {
    setRerender((old) => !old);
  }
  const markupLimit = props.mat.getMarkupLimit();

  function onMarketTA1(event: React.ChangeEvent<HTMLInputElement>): void {
    props.mat.marketTa1 = event.target.checked;
    rerender();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <>
        <Typography variant="h4">Market-TA.I</Typography>
        <Typography>
          The maximum sale price you can mark this up to is {formatMoney(props.mat.bCost + markupLimit)}. This means
          that if you set the sale price higher than this, you will begin to experience a loss in number of sales
          <br></br>
          <br></br>
          If this is enabled, then this Material will automatically be sold at the price identified by Market-TA.I (i.e.
          the price shown above)
        </Typography>

        <FormControlLabel
          control={<Switch checked={props.mat.marketTa1} onChange={onMarketTA1} />}
          label={<Typography>Use Market-TA.I for Auto-Sale Price</Typography>}
        />
      </>

      <MarketTA2 mat={props.mat} />
    </Modal>
  );
}
