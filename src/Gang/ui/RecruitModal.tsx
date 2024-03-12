import React, { useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/helpers/keyCodes";

interface IRecruitPopupProps {
  open: boolean;
  enforcerOK: boolean;
  hackerOK: boolean;
  onClose: () => void;
  onRecruit: () => void;
}

/** React Component for the popup used to recruit new gang members. */
export function RecruitModal(props: IRecruitPopupProps): React.ReactElement {
  const gang = useGang();
  const [name, setName] = useState("");
  const [isEnfocer, setType] = useState(true);

  const canSwitchType = props.enforcerOK && props.hackerOK;
  if (!props.enforcerOK) {
    setType(false);
  }

  const disabled = name === "" || !gang.canRecruitMember();
  function recruit(): void {
    if (disabled) return;
    // At this point, the only way this can fail is if you already
    // have a gang member with the same name
    if (!gang.recruitMember(name, isEnfocer) && name !== "") {
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

  function switchType(): void {
    setType(!isEnfocer);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>Enter a name for your new <Button disabled={!canSwitchType} onClick={switchType}>{isEnfocer ? "Enforcer" : "Hacker"}</Button>:</Typography>
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
