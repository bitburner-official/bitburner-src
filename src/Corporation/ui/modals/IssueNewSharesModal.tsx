import React, { useState } from "react";
import { formatShares } from "../../../ui/formatNumber";
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
  const ceoOwnership = corp.numShares / (corp.totalShares + props.shares);
  const newSharePrice = corp.getTargetSharePrice(ceoOwnership);
  const maxNewShares = corp.calculateMaxNewShares();
  let newShares = props.shares;
  if (isNaN(newShares)) {
    return <Typography>Invalid input</Typography>;
  }

  // Round to nearest ten-million
  newShares = Math.round(newShares / 10e6) * 10e6;

  if (newShares < 10e6) {
    return <Typography>Must issue at least 10 million new shares</Typography>;
  }

  if (newShares > maxNewShares) {
    return <Typography>You cannot issue that many shares</Typography>;
  }

  return (
    <Typography>
      Issue {formatShares(newShares)} new shares for <Money money={newShares * newSharePrice} />?
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

  const ceoOwnership = corp.numShares / (corp.totalShares + shares);
  const newSharePrice = corp.getTargetSharePrice(ceoOwnership);

  const newShares = Math.round((shares || 0) / 10e6) * 10e6;
  const disabled = isNaN(shares) || isNaN(newShares) || newShares < 10e6 || newShares > maxNewShares;

  function issueNewShares(): void {
    if (isNaN(shares)) return;
    if (disabled) return;
    const [profit, newShares, privateShares] = IssueNewShares(corp, shares);

    props.onClose();

    const dialogContents = (
      <Typography>
        Issued {formatShares(newShares)} new share and raised <Money money={profit} />.
        {privateShares > 0
          ? "\n" + formatShares(privateShares) + " of these shares were bought by private investors."
          : ""}
        <br />
        <br />
        <b>{corp.name}</b>'s stock price decreased to <Money money={corp.sharePrice} />;
      </Typography>
    );
    dialogBoxCreate(dialogContents);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) issueNewShares();
  }

  const nextCooldownInHours =
    ((corp.totalShares / corpConstants.initialShares) * corpConstants.issueNewSharesCooldown) / 18e3;

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        You can issue new equity shares (i.e. stocks) in order to raise capital.
        <ul>
          <li>The number of new shares issued must be a multiple of 10 million.</li>
          <li>You can issue at most {formatShares(maxNewShares)} new shares.</li>
          <li>
            Issuing {formatShares(shares)} new shares will cause dilution, reducing <b>{corp.name}</b>'s stock price to{" "}
            <Money money={newSharePrice} /> and reducing dividends per share.
          </li>
          <li>All new shares are sold at the lower price.</li>
          <li>The money from issuing new shares will be deposited directly into your Corporation's funds.</li>
          <li>
            You will not be able to issue new shares again (or dissolve the corporation) for{" "}
            {nextCooldownInHours.toFixed()} hours.
          </li>
        </ul>
        When you choose to issue new equity, private shareholders have first priority for up to 0.5n% of the new shares,
        where n is the percentage of the company currently owned by private shareholders. If they choose to exercise
        this option, these newly issued shares become private, restricted shares, which means you cannot buy them back.
      </Typography>
      <EffectText shares={shares} />
      <NumberInput
        defaultValue={shares}
        autoFocus
        placeholder="# New Shares"
        onChange={setShares}
        onKeyDown={onKeyDown}
      />
      <Button disabled={disabled} onClick={issueNewShares} sx={{ mx: 1 }}>
        Issue New Shares
      </Button>
    </Modal>
  );
}
