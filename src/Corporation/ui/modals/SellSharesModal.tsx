import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { formatShares } from "../../../ui/formatNumber";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import * as corpConstants from "../../data/Constants";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { sellShares } from "../../Actions";
import { KEY } from "../../../utils/KeyboardEventKey";
import { NumberInput } from "../../../ui/React/NumberInput";
import { sellSharesFailureReason } from "../../helpers";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player sell Corporation shares
// This is created when the player clicks the "Sell Shares" button in the overview panel
export function SellSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const [profit, sharePrice] = corp.calculateShareSale((props.open && shares) || 0);
  const disabledText = sellSharesFailureReason(corp, shares);

  function sell(): void {
    if (disabledText) return;
    try {
      sellShares(corp, shares);
      dialogBoxCreate(
        <>
          <Typography>
            你以 <Money money={profit} /> 的价格出售了 {formatShares(shares)} 股股份。
          </Typography>
          <Typography>
            <b>{corp.name}</b> 的股价跌至每股 <Money money={sharePrice} />。
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
      setShares(NaN);
    } catch (error) {
      dialogBoxCreate(String(error));
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) sell();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        输入你想要出售的股份数量。
        <ul>
          <li>出售股份会因市场力量导致股价下跌。</li>
          <li>出售股份所得的资金会直接归你所有（而不是你的企业）。</li>
          <li>
            之后 <b>{corp.convertCooldownToString(corpConstants.sellSharesCooldown)}</b>
            内你将无法再次出售股份。
          </li>
        </ul>
        你目前持有 <b>{corp.name}</b> 的 {formatShares(corp.numShares)} 股股票，每股价值{" "}
        <Money money={corp.sharePrice} />。
      </Typography>
      <br />
      <NumberInput
        defaultValue={shares || ""}
        variant="standard"
        autoFocus
        placeholder="要出售的股份数"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={sell}>
        出售股份
      </ButtonWithTooltip>
      <br />
      <Typography sx={{ minHeight: "3em" }}>
        {!shares ? null : disabledText ? (
          disabledText
        ) : (
          <>
            你将获得 <Money money={profit} />。
            <br />
            <b>{corp.name}</b> 的股价将稳定在每股 <Money money={sharePrice} />。
          </>
        )}
      </Typography>
    </Modal>
  );
}
