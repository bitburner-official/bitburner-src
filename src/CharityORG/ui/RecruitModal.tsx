import React, { useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { useCharityORG } from "./Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/helpers/keyCodes";

interface IRecruitPopupProps {
  open: boolean;
  onClose: () => void;
  onRecruit: () => void;
}

/** React Component for the popup used to recruit new charity volunteers. */
export function RecruitModal(props: IRecruitPopupProps): React.ReactElement {
  const charityORG = useCharityORG();
  const [name, setName] = useState("");

  const disabled = name === "" || !charityORG.canRecruitMember();
  function recruit(): void {
    if (disabled) return;
    // At this point, the only way this can fail is if you already
    // have a gang member with the same name
    if (!charityORG.recruitMember(name) && name !== "") {
      dialogBoxCreate("You already have a gang member with this name!");
      return;
    }

    props.onRecruit();
    setName("");
    props.onClose();
  }

  function onKeyUp(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === KEY.ENTER) recruit();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>Enter a name for your new Charity Volunteer:</Typography>
      <br />
      <TextField
        autoFocus
        onKeyUp={onKeyUp}
        onChange={onChange}
        type="text"
        placeholder="unique name"
        spellCheck="false"
        InputProps={{
          endAdornment: (
            <Button disabled={disabled} onClick={recruit}>
              Recruit
            </Button>
          ),
        }}
      />
    </Modal>
  );
}
