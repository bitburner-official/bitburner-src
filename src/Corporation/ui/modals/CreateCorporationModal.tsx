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
import { createCorporation } from "../../Actions";
import { costOfCreatingCorporation } from "../../helpers";

interface IProps {
  open: boolean;
  onClose: () => void;
  restart: boolean;
}

export function CreateCorporationModal(props: IProps): React.ReactElement {
  const cost = costOfCreatingCorporation(props.restart);
  const canSelfFund = Player.canAfford(cost);
  const [name, setName] = useState("");

  if (!Player.canAccessCorporation() || (Player.corporation && !props.restart)) {
    return <></>;
  }

  const disabledTextForNoName = name === "" ? "Enter a name for the corporation" : "";

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  function createCorporationWithUI(corporationName: string, selfFund: boolean): void {
    if (!createCorporation(corporationName, selfFund, props.restart)) {
      return;
    }
    props.onClose();
    Router.toPage(Page.Corporation);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        {!props.restart ? (
          <>
            Would you like to start a corporation? This will require <Money money={cost} forPurchase={true} /> for
            registration and initial funding.{" "}
            {Player.bitNodeN === 3 && (
              <>
                This <Money money={cost} /> can either be self-funded, or you can obtain the seed money from the
                government in exchange for {formatShares(500e6)} shares (a <b>33.3%</b> stake in the company).
              </>
            )}
          </>
        ) : (
          <>
            Would you like to sell your position as CEO and start a new corporation? Everything from your current
            corporation will be gone and you start fresh.
          </>
        )}
        <br />
        <br />
        If you would like to start {props.restart ? "a new" : ""} one, please enter a name for your corporation below:
      </Typography>
      <br />
      <TextField autoFocus={true} placeholder="Corporation Name" onChange={onChange} value={name} />
      {Player.bitNodeN === 3 && (
        <ButtonWithTooltip onClick={() => createCorporationWithUI(name, false)} disabledTooltip={disabledTextForNoName}>
          Use seed money
        </ButtonWithTooltip>
      )}
      <ButtonWithTooltip
        onClick={() => createCorporationWithUI(name, true)}
        disabledTooltip={disabledTextForNoName || (canSelfFund ? "" : "Insufficient player funds")}
      >
        Self-Fund (<Money money={cost} forPurchase={true} />)
      </ButtonWithTooltip>
    </Modal>
  );
}
