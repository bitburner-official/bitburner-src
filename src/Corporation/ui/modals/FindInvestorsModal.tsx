import React from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { formatPercent, formatShares } from "../../../ui/formatNumber";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import { acceptInvestmentOffer } from "../../Actions";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player manage investment offers
export function FindInvestorsModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const { funds, shares } = corp.getInvestmentOffer();

  function findInvestors(): void {
    if (shares === 0) return;
    try {
      acceptInvestmentOffer(corp);
      dialogBoxCreate(
        <>
          <Typography>你接受了该投资报价。</Typography>
          <Typography>
            <b>{corp.name}</b> 获得了 <Money money={funds} />。
          </Typography>
          <Typography>
            你剩余的股权为 <b>{formatPercent(corp.numShares / corp.totalShares, 1)}</b>。
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
    } catch (error) {
      dialogBoxCreate(String(error));
    }
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        一家投资公司提出以{" "}
        <b>{formatPercent(shares / corp.totalShares, 1)}</b> 的公司股权，购买 {formatShares(shares)} 股股票。
        <br />
        <br />
        <b>{corp.name}</b> 将获得 <Money money={funds} />。
        <br />
        你的股权将降至 <b>{formatPercent((corp.numShares - shares) / corp.totalShares, 1)}</b>。
        <br />
        <br />
        <b>提示</b>：如果你的企业正在盈利，投资公司会出更高的价钱。
        <br />
        <br />
        你接受这份报价吗？
      </Typography>
      <br />
      <Button onClick={findInvestors}>接受</Button> <Button onClick={props.onClose}>拒绝</Button>
    </Modal>
  );
}
