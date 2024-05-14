import React, { useState } from "react";
import { formatShares, formatPercent } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { NumberInput } from "../../../ui/React/NumberInput";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import { KEY } from "../../../utils/helpers/keyCodes";
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
            Issued {formatShares(newShares)} new shares and raised <Money money={profit} />.
          </Typography>
          {privateShares > 0 ? (
            <Typography>{formatShares(privateShares)} of these shares were bought by private investors.</Typography>
          ) : null}
          <Typography>
            <b>{corp.name}</b>'s stock price fell to <Money money={corp.sharePrice} />.
          </Typography>
        </>,
      );
      props.onClose();
      props.rerender();
    } catch (err) {
      dialogBoxCreate(`${err}`);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) issueNewShares();
  }

  const nextCooldown = corpConstants.issueNewSharesCooldown * (corp.totalShares / corpConstants.initialShares);

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography component="div">
        You can issue new equity shares (i.e. stocks) in order to raise capital.
        <ul>
          <li>Issuing new shares will cause dilution, lowering stock price and reducing dividends per share.</li>
          <li>New shares are sold between the current price and the updated price.</li>
          <li>The money from issuing new shares will be deposited directly into your Corporation's funds.</li>
          <li>
            Private shareholders have first priority for buying new shares, up to half of their existing stake in the
            company <b>({formatPercent(privateOwnedRatio / 2, 1)})</b>.
            <br />
            If they choose to exercise this option, these newly issued shares become private, restricted shares, which
            means you cannot buy them back.
          </li>
          <li>
            You will not be able to issue new shares again for <b>{corp.convertCooldownToString(nextCooldown)}</b>.
          </li>
        </ul>
        You can issue at most {formatShares(maxNewShares)} new shares.
        <br />
        The number of new shares issued must be a multiple of 10 million.
      </Typography>
      <br />
      <NumberInput
        defaultValue={shares || ""}
        autoFocus
        placeholder="# New Shares"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <ButtonWithTooltip disabledTooltip={disabledText} onClick={issueNewShares}>
        Issue New Shares
      </ButtonWithTooltip>
      <br />
      <Typography sx={{ minHeight: "6em" }}>
        {disabledText ? (
          disabledText
        ) : (
          <>
            Issue {formatShares(newShares)} new shares?
            <br />
            {maxPrivateShares > 0
              ? `Private investors may buy up to ${formatShares(
                  maxPrivateShares,
                )} of these shares and keep them off the market.`
              : null}
            <br />
            <b>{corp.name}</b> will receive <Money money={profit} />.
            <br />
            <b>{corp.name}</b>'s stock price will fall to <Money money={newSharePrice} /> per share.
          </>
        )}
      </Typography>
    </Modal>
  );
}
