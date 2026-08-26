import React, { useState } from "react";
import { Modal } from "../../ui/React/Modal";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/KeyboardEventKey";
import { RecruitmentResult } from "../Gang";

interface IRecruitPopupProps {
  open: boolean;
  onClose: () => void;
  onRecruit: () => void;
}

/** React Component for the popup used to recruit new gang members. */
export function RecruitModal(props: IRecruitPopupProps): React.ReactElement {
  const gang = useGang();
  const [name, setName] = useState("");

  const disabled = name === "" || gang.canRecruitMember() !== RecruitmentResult.Success;
  function recruit(): void {
    if (disabled) {
      return;
    }
    const result = gang.recruitMember(name);
    if (result !== RecruitmentResult.Success) {
      dialogBoxCreate(result);
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
      <Typography>为你的新帮派成员起一个名字：</Typography>
      <br />
      <TextField
        autoFocus
        onKeyUp={onKeyUp}
        onChange={onChange}
        type="text"
        placeholder="独一无二的名字"
        spellCheck="false"
        InputProps={{
          endAdornment: (
            <Button disabled={disabled} onClick={recruit}>
              招募
            </Button>
          ),
        }}
      />
    </Modal>
  );
}
