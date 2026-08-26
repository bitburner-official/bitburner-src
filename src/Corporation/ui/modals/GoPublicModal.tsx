import React, { useState } from "react";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { formatShares } from "../../../ui/formatNumber";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { NumberInput } from "../../../ui/React/NumberInput";
import Box from "@mui/material/Box";
import { KEY } from "../../../utils/KeyboardEventKey";
import { isPositiveInteger } from "../../../types";
import * as actions from "../../Actions";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player manage exports
export function GoPublicModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const ceoOwnership = (corp.numShares - (shares || 0)) / corp.totalShares;
  const initialSharePrice = corp.getTargetSharePrice(ceoOwnership);

  const disabledText =
    shares >= corp.numShares
      ? "无法发行这么多股份"
      : shares !== 0 && !isPositiveInteger(shares)
      ? "发行股份数必须是非负整数"
      : "";

  function goPublic(): void {
    if (disabledText) return;
    try {
      actions.goPublic(corp, shares);
      dialogBoxCreate(
        <Typography>
          <b>{corp.name}</b> 已上市，并在首次公开发行（IPO）中获得了 <Money money={shares * initialSharePrice} />。
        </Typography>,
      );
      props.onClose();
      props.rerender();
      setShares(NaN);
    } catch (error) {
      dialogBoxCreate(String(error));
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) goPublic();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        输入你想要为首次公开发行（IPO）发行的股份数量。
        <ul>
          <li>这些股份将被公开出售，你将不再拥有它们。</li>
          <li>IPO所得资金会直接存入企业的资金账户。</li>
        </ul>
        你可以发行 {formatShares(corp.numShares)} 股中的一部分，但不能全部发行。
      </Typography>
      <br />
      <Box display="flex" alignItems="center">
        <NumberInput
          defaultValue={shares || ""}
          onChange={setShares}
          autoFocus
          placeholder="要发行的股份数"
          onKeyDown={onKeyDown}
        />
        <ButtonWithTooltip disabledTooltip={disabledText} onClick={goPublic}>
          上市
        </ButtonWithTooltip>
      </Box>
      <br />
      <Typography sx={{ minHeight: "3em" }}>
        {isNaN(shares) ? null : disabledText ? (
          disabledText
        ) : (
          <>
            要以每股 <Money money={initialSharePrice} /> 的价格上市吗？
            <br />
            <b>{corp.name}</b> 将获得 <Money money={initialSharePrice * (shares || 0)} />。
          </>
        )}
      </Typography>
    </Modal>
  );
}
