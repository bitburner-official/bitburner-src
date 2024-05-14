import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { MoneyRate } from "../../../ui/React/MoneyRate";
import * as corpConstants from "../../data/Constants";
import * as actions from "../../Actions";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../../utils/helpers/keyCodes";
interface IProps {
  open: boolean;
  onClose: () => void;
}

// Create a popup that lets the player issue & manage dividends
// This is created when the player clicks the "Issue Dividends" button in the overview panel
export function IssueDividendsModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [percent, setPercent] = useState(0);

  const canIssue = !isNaN(percent) && percent >= 0 && percent <= corpConstants.dividendMaxRate * 100;
  function issueDividends(): void {
    if (!canIssue) return;
    if (percent === null) return;
    try {
      actions.issueDividends(corp, percent / 100);
    } catch (err) {
      dialogBoxCreate(err + "");
    }

    props.onClose();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) issueDividends();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target.value === "") setPercent(0);
    else {
      let p = parseFloat(event.target.value);
      if (p > 100) p = 100;
      if (p < 0) p = 0;
      setPercent(p);
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Dividends are a distribution of a portion of the corporation's profits to the shareholders. This includes
        yourself, as well.
        <br />
        <br />
        Note that issuing dividends will negatively affect <b>{corp.name}</b>'s stock price.
        <br />
        <br />
        In order to issue dividends, simply allocate some percentage of your Corporation's profits to dividends. This
        percentage must be an integer between 0 and 100. (A percentage of 0 means no dividends will be issued.)
        <br />
        <br />
        <b>Example:</b> Assume your corporation makes <MoneyRate money={100e6} /> in profit and you allocate 40% of that
        towards dividends. That means your corporation will gain <MoneyRate money={60e6} /> in funds and the remaining{" "}
        <MoneyRate money={40e6} /> will be paid as dividends. Since your corporation starts with 1 billion shares, every
        shareholder will be paid <Money money={0.04} /> per share per second before taxes.
      </Typography>
      <br />
      <TextField
        autoFocus
        value={percent}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Dividend %"
        type="number"
      />
      <Button disabled={!canIssue} sx={{ mx: 1 }} onClick={issueDividends}>
        Allocate Dividend Percentage
      </Button>
    </Modal>
  );
}
