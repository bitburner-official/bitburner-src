import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/helpers/keyCodes";
import { FactionName } from "@enums";
import { AllGangFactionInfo } from "../../Gang/data/FactionInfo";
import { GangConstants } from "../../Gang/data/Constants";

interface IProps {
  open: boolean;
  onClose: () => void;
  facName: FactionName;
}

/** React Component for the popup used to create a new gang. */
export function CreateGangModal(props: IProps): React.ReactElement {
  function createGang(): void {
    Player.startGang(props.facName);
    props.onClose();
    Router.toPage(Page.Gang);
  }

  function onKeyUp(event: React.KeyboardEvent): void {
    if (event.key === KEY.ENTER) createGang();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Would you like to create a new Gang with {props.facName}?
        <br />
        <br />
        This will prevent you from creating a Gang with any other Faction until the BitNode is destroyed or abandoned.
        It will also reset your reputation with {props.facName}.
        <br />
        <br />
        This gang will have a maximum of {AllGangFactionInfo[props.facName].numEnforcers} enforcers and {AllGangFactionInfo[props.facName].numHackers} hackers.
        All gangs are limited to a maximum of {GangConstants.MaximumGangMembers} total gang members.
        <br />
        <br />
        Other than name and enforcer/hacker maximum, there are no differences between gangs.
      </Typography>
      <Button onClick={createGang} onKeyUp={onKeyUp} autoFocus>
        Create Gang
      </Button>
      <Button onClick={props.onClose}>Cancel</Button>
    </Modal>
  );
}
