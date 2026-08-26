import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { formatShares } from "../../../ui/formatNumber";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { NumberInput } from "../../../ui/React/NumberInput";
import { buyBackShares } from "../../Actions";
import { KEY } from "../../../utils/KeyboardEventKey";
import { buybackSharesFailureReason } from "../../helpers";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player buyback shares
// This is created when the player clicks the "Buyback Shares" button in the overview panel
export function BuybackSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const [cost, sharePrice] = corp.calculateShareBuyback((props.open && shares) || 0);
  const disabledText = buybackSharesFailureReason(corp, shares);

  function buy(): void {
    if (disabledText) return;
    try {
      buyBackShares(corp, shares);
      dialogBoxCreate(
        <>
          <Typography>
            你以 <Money money={cost} /> 的价格购买了 {formatShares(shares)} 股股份。
          </Typography>
          <Typography>
            <b>{corp.name}</b> 的股价涨至每股 <Money money={sharePrice} />。
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
    if (event.key === KEY.ENTER) buy();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        输入你想要回购的已发行股份数量。
        <ul>
          <li>回购股份会因市场力量导致股价上涨。</li>
          <li>这些股份必须以高于市价10%的溢价购买。</li>
          <li>你需要用自己的钱（而不是企业的资金）购买这些股份。</li>
        </ul>
        <b>{corp.name}</b> 目前有 {formatShares(corp.issuedShares)} 股已发行股票，每股价值{" "}
        <Money money={corp.sharePrice} />。
      </Typography>
      <br />
      <NumberInput
        defaultValue={shares || ""}
        autoFocus={true}
        placeholder="要回购的股份数"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={buy}>
        购买股份
        {cost > 0 ? (
          <>
            &nbsp;-&nbsp;
            <Money money={cost} forPurchase={true} />{" "}
          </>
        ) : (
          <></>
        )}
      </ButtonWithTooltip>
      <br />
      <Typography sx={{ minHeight: "1.5em" }}>
        {!shares ? null : disabledText ? (
          disabledText
        ) : (
          <>
            <b>{corp.name}</b> 的股价将稳定在每股 <Money money={sharePrice} />。
          </>
        )}
      </Typography>
    </Modal>
  );
}
