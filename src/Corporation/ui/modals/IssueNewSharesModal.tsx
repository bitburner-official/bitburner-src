import React, { useState } from "react";
import { formatShares, formatPercent } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { NumberInput } from "../../../ui/React/NumberInput";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { KEY } from "../../../utils/KeyboardEventKey";
import * as actions from "../../Actions";
import * as corpConstants from "../../data/Constants";
import { issueNewSharesFailureReason } from "../../helpers";

interface IProps {
  open: boolean;
  onClose: () => void;
  rerender: () => void;
}

// Create a popup that lets the player issue new shares
// This is created when the player clicks the "Issue New Shares" buttons in the overview panel
export function IssueNewSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const [shares, setShares] = useState<number>(NaN);

  const maxNewShares = corp.calculateMaxNewShares();
  const newShares = Math.round((shares || 0) / 10e6) * 10e6;

  const ceoOwnership = corp.numShares / (corp.totalShares + (newShares || 0));
  const newSharePrice = corp.getTargetSharePrice(ceoOwnership);
  const profit = ((shares || 0) * (corp.sharePrice + newSharePrice)) / 2;

  const privateOwnedRatio = corp.investorShares / corp.totalShares;
  const maxPrivateShares = Math.round(((newShares / 2) * privateOwnedRatio) / 10e6) * 10e6;

  const disabledText = issueNewSharesFailureReason(corp, shares);

  function issueNewShares(): void {
    if (disabledText) return;
    try {
      const [profit, newShares, privateShares] = actions.issueNewShares(corp, shares);
      dialogBoxCreate(
        <>
          <Typography>
            发行了 {formatShares(newShares)} 股新股，筹集了 <Money money={profit} />。
          </Typography>
          {privateShares > 0 ? (
            <Typography>其中 {formatShares(privateShares)} 股被私人投资者购买。</Typography>
          ) : null}
          <Typography>
            <b>{corp.name}</b> 的股价跌至 <Money money={corp.sharePrice} />。
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
    } catch (error) {
      dialogBoxCreate(String(error));
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) issueNewShares();
  }

  const nextCooldown = corpConstants.issueNewSharesCooldown * (corp.totalShares / corpConstants.initialShares);

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        你可以发行新股（即股票）来筹集资金。
        <ul>
          <li>发行新股会造成股权稀释，降低股价并减少每股股息。</li>
          <li>新股将以当前价格和更新后的价格之间的价格售出。</li>
          <li>发行新股所得的资金会直接存入企业的资金账户。</li>
          <li>
            私人股东拥有购买新股的优先权，最多可购买其在公司现有持股的一半{" "}
            <b>（{formatPercent(privateOwnedRatio / 2, 1)}）</b>。
            <br />
            如果他们选择行使该权利，这些新发行的股份将成为私人的受限股份，这意味着你无法回购它们。
          </li>
          <li>
            之后 <b>{corp.convertCooldownToString(nextCooldown)}</b> 内你将无法再次发行新股。
          </li>
        </ul>
        你最多可以发行 {formatShares(maxNewShares)} 股新股。
        <br />
        新股发行数量必须是1000万的整数倍。
      </Typography>
      <br />
      <NumberInput
        defaultValue={shares || ""}
        autoFocus
        placeholder="新股数量"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={issueNewShares}>
        发行新股
      </ButtonWithTooltip>
      <br />
      <Typography sx={{ minHeight: "6em" }}>
        {disabledText ? (
          disabledText
        ) : (
          <>
            要发行 {formatShares(newShares)} 股新股吗？
            <br />
            {maxPrivateShares > 0
              ? `私人投资者最多可能购买其中 ${formatShares(
                  maxPrivateShares,
                )} 股，并使其不流入市场。`
              : null}
            <br />
            <b>{corp.name}</b> 将获得 <Money money={profit} />。
            <br />
            <b>{corp.name}</b> 的股价将跌至每股 <Money money={newSharePrice} />。
          </>
        )}
      </Typography>
    </Modal>
  );
}
