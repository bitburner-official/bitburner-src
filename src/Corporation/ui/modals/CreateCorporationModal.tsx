import React, { useState } from "react";

import { Money } from "../../../ui/React/Money";
import { Modal } from "../../../ui/React/Modal";
import { Router } from "../../../ui/GameRoot";
import { Page } from "../../../ui/Router";
import { formatShares } from "../../../ui/formatNumber";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import TextField from "@mui/material/TextField";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCorporationModal(props: IProps): React.ReactElement {
  const canSelfFund = Player.canAfford(150e9);
  const [name, setName] = useState("");

  if (!Player.canAccessCorporation() || Player.corporation) {
    props.onClose();
    return <></>;
  }

  const disabledTextForNoName = name === "" ? "Enter a name for the corporation" : "";

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  function selfFund(): void {
    if (!canSelfFund) return;
    if (name == "") return;

    Player.startCorporation(name, false);
    Player.loseMoney(150e9, "corporation");

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
        Would you like to start a corporation? This will require <Money money={150e9} forPurchase={true} /> for
        registration and initial funding.{" "}
        {Player.bitNodeN === 3 && (
          <>
            This <Money money={150e9} /> can either be self-funded, or you can obtain the seed money from the government
            in exchange for {formatShares(500e6)} shares (a <b>33.3%</b> stake in the company).
          </>
        )}
        <br />
        <br />
        If you would like to start one, please enter a name for your corporation below:
      </Typography>
      <br />
      <TextField autoFocus={true} placeholder="Corporation Name" onChange={onChange} value={name} />
      {Player.bitNodeN === 3 && (
        <ButtonWithTooltip onClick={seed} disabledTooltip={disabledTextForNoName}>
          Use seed money
        </ButtonWithTooltip>
      )}
      <ButtonWithTooltip
        onClick={selfFund}
        disabledTooltip={disabledTextForNoName || (canSelfFund ? "" : "Insufficient player funds")}
      >
        Self-Fund (<Money money={150e9} forPurchase={true} />)
      </ButtonWithTooltip>
    </Modal>
  );
}
