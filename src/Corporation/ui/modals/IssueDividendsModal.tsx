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
import { KEY } from "../../../utils/KeyboardEventKey";
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
    } catch (error) {
      dialogBoxCreate(String(error));
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
        股息是将企业利润的一部分分配给股东。这也包括你自己。
        <br />
        <br />
        请注意，派发股息会对 <b>{corp.name}</b> 的股价产生负面影响。
        <br />
        <br />
        要派发股息，只需将企业利润的一定百分比分配给股息即可。该百分比必须是0到100之间的整数。（百分比为0表示不派发任何股息。）
        <br />
        <br />
        <b>示例：</b>假设你的企业获得 <MoneyRate money={100e6} /> 利润，而你将其中40%分配给股息。这意味着你的企业将获得{" "}
        <MoneyRate money={60e6} /> 资金，剩下的 <MoneyRate money={40e6} /> 将作为股息支付。由于你的企业最初拥有10亿股，在缴纳贡金之前，每位股东每股每秒将获得{" "}
        <Money money={0.04} />。
      </Typography>
      <br />
      <TextField
        autoFocus
        value={percent}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="股息百分比"
        type="number"
      />
      <Button disabled={!canIssue} sx={{ mx: 1 }} onClick={issueDividends}>
        设置股息比例
      </Button>
    </Modal>
  );
}
