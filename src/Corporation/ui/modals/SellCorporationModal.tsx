import React, { useState } from "react";

import { Money } from "../../../ui/React/Money";
import { Modal } from "../../../ui/React/Modal";
import { Router } from "../../../ui/GameRoot";
import { Page } from "../../../ui/Router";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function SellCorporationModal(props: IProps): React.ReactElement {
  let cost = 150e9;
  if (!Player.corporation?.seedFunded) {
    cost /= 3;
  }
  const canSelfFund = Player.canAfford(cost);

  const [name, setName] = useState("");
  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  function selfFund(): void {
    if (!canSelfFund) return;
    if (name == "") return;

    Player.startCorporation(name, false);
    Player.loseMoney(cost, "corporation");

    props.onClose();
    Router.toPage(Page.Corporation);
  }

  function seed(): void {
    if (name == "") {
      return;
    }

    Player.startCorporation(name, true);

    props.onClose();
    Router.toPage(Page.Corporation);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Would you like to sell your position as CEO and start a new corporation? Everything from your current
        corporation will be gone and you start fresh.
        <br />
        <br />
        If you would like to start new one, please enter a name for your corporation below:
      </Typography>
      <TextField autoFocus={true} placeholder="Corporation Name" onChange={onChange} value={name} />
      {Player.bitNodeN === 3 && (
        <Button onClick={seed} disabled={name == ""}>
          Use seed money
        </Button>
      )}
      <Button onClick={selfFund} disabled={name == "" || !canSelfFund}>
        Self-Fund (<Money money={cost} forPurchase={true} />)
      </Button>
    </Modal>
  );
}
