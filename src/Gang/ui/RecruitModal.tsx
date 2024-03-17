import React, { useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/helpers/keyCodes";
import { GangMemberType } from "@enums";

interface IRecruitPopupProps {
  open: boolean;
  onClose: () => void;
  onRecruit: () => void;
}

/** React Component for the popup used to recruit new gang members. */
export function RecruitModal(props: IRecruitPopupProps): React.ReactElement {
  const gang = useGang();
  const [name, setName] = useState("");
  const [memberType, setMemberType] = useState<GangMemberType>(GangMemberType.Enforcer);

  if (gang.getRecruitsAvailableByType(memberType) <= 0) {
    switchType();
  }

  const disabled = name === "" || !gang.canRecruitMember();
  function recruit(): void {
    if (disabled) return;
    // At this point, the only way this can fail is if you already
    // have a gang member with the same name
    if (!gang.recruitMember(name, memberType) && name !== "") {
      dialogBoxCreate("You already have a gang member with this name!");
      return;
    }

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
    const memberTypes = Object.values(GangMemberType);
    const currentIndex = memberTypes.indexOf(memberType);
    for (let i = currentIndex + 1; i < memberTypes.length + currentIndex + 1; ++i) {
      const currentType = memberTypes[i % memberTypes.length];
      if (gang.getRecruitsAvailableByType(currentType) > 0) {
        setMemberType(currentType);
        return;
      }
    }
  
    throw new Error('No recruits available for any member type.');
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>Enter a name for your new <Button onClick={switchType}>{memberType}</Button>:</Typography>
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
