import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/KeyboardEventKey";
import { FactionName } from "@enums";

interface IProps {
  open: boolean;
  onClose: () => void;
  facName: FactionName;
}

/** React Component for the popup used to create a new gang. */
export function CreateGangModal(props: IProps): React.ReactElement {
  const combatGangText =
    props.facName +
    " is a COMBAT gang and its members will have different tasks than in HACKING gangs. " +
    "Compared to hacking gangs, progression with a combat gang can be more difficult as territory management " +
    "is more important. However, well-managed combat gangs can progress faster than hacking ones.";

  const hackingGangText =
    props.facName +
    " is a HACKING gang and its members will have different tasks than in COMBAT gangs. " +
    "Compared to combat gangs, progression with a hacking gang is slower but more straightforward as territory warfare " +
    "is not as important.";

  function isHacking(): boolean {
    return [FactionName.NiteSec, FactionName.TheBlackHand].includes(props.facName);
  }

  function createGang(): void {
    Player.startGang(props.facName, isHacking());
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
        {isHacking() ? hackingGangText : combatGangText}
        <br />
        <br />
        Other than hacking vs combat and name, there are no differences between gangs.
      </Typography>
      <Button onClick={createGang} onKeyUp={onKeyUp} autoFocus>
        Create Gang
      </Button>
      <Button onClick={props.onClose}>Cancel</Button>
    </Modal>
  );
}
