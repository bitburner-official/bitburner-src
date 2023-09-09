import React, { useState } from "react";
import { formatShares, formatPercent } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { Money } from "../../../ui/React/Money";
import { useCorporation } from "../Context";
import Typography from "@mui/material/Typography";
import { NumberInput } from "../../../ui/React/NumberInput";
import Button from "@mui/material/Button";
import { KEY } from "../../../utils/helpers/keyCodes";
import { IssueNewShares } from "../../Actions";
import * as corpConstants from "../../data/Constants";

interface IEffectTextProps {
  shares: number | null;
}

function EffectText(props: IEffectTextProps): React.ReactElement {
  const corp = useCorporation();
  if (props.shares === null) return <></>;
  const ceoOwnership = corp.numShares / (corp.totalShares + (props.shares || 0));
  const newSharePrice = corp.getTargetSharePrice(ceoOwnership);
  const maxNewShares = corp.calculateMaxNewShares();
  let newShares = props.shares;
  if (isNaN(newShares)) {
    return <Typography>&nbsp;</Typography>;
  }

  // Round to nearest ten-million
  newShares = Math.round(newShares / 10e6) * 10e6;

  const privateOwnedRatio = corp.investorShares / corp.totalShares;
  const maxPrivateShares = Math.round(((newShares / 2) * privateOwnedRatio) / 10e6) * 10e6;

  if (newShares < 10e6) {
    return <Typography>Must issue at least 10 million new shares</Typography>;
  }

  if (newShares > maxNewShares) {
    return <Typography>You cannot issue that many shares</Typography>;
  }

  return (
    <Typography>
      Issue {formatShares(newShares)} new shares?
      {privateOwnedRatio > 0 ? (
        <>
          <br />
          Private investors may buy up to {formatShares(maxPrivateShares)} of these shares and keep them off the market.
        </>
      ) : (
        <></>
      )}
      <br />
      <b>{corp.name}</b>'s stock price will fall to <Money money={newSharePrice} /> per share.
      <br />
      <b>{corp.name}</b> will receive <Money money={newShares * newSharePrice} />.
    </Typography>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
}

// Create a popup that lets the player issue new shares
// This is created when the player clicks the "Issue New Shares" buttons in the overview panel
export function IssueNewSharesModal(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const maxNewShares = corp.calculateMaxNewShares();
  const [shares, setShares] = useState<number>(maxNewShares);

  const newShares = Math.round(shares / 10e6) * 10e6;
  const disabled = isNaN(shares) || isNaN(newShares) || newShares < 10e6 || newShares > maxNewShares;

  function issueNewShares(): void {
    if (isNaN(shares)) return;
    if (disabled) return;
    const [profit, newShares, privateShares] = IssueNewShares(corp, shares);

    props.onClose();

    const dialogContents = (
      <Typography>
        Issued {formatShares(newShares)} new shares and raised <Money money={profit} />.
        {privateShares > 0
          ? "\n" + formatShares(privateShares) + " of these shares were bought by private investors."
          : ""}
        <br />
        <br />
        <b>{corp.name}</b>'s stock price decreased to <Money money={corp.sharePrice} />.
      </Typography>
    );
    dialogBoxCreate(dialogContents);
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
          <li>All new shares are sold at the lower price.</li>
          <li>The money from issuing new shares will be deposited directly into your Corporation's funds.</li>
          <li>
            Private shareholders have first priority for buying new shares, up to half of their existing stake in the
            company <b>({formatPercent(corp.investorShares / 2 / corp.totalShares, 1)})</b>.
            <br />
            If they choose to exercise this option, these newly issued shares become private, restricted shares, which
            means you cannot buy them back.
          </li>
          <li>
            You will not be able to issue new shares again (or dissolve the corporation) for{" "}
            <b>{corp.convertCooldownToString(nextCooldown)}</b>.
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
      <Button disabled={disabled} onClick={issueNewShares} sx={{ mx: 1 }}>
        Issue New Shares
      </Button>
      <br />
      <br />
      <EffectText shares={shares} />
    </Modal>
  );
}
