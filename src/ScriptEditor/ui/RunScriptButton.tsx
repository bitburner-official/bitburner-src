import React, { ReactElement, useRef } from "react";

import Button, { ButtonProps } from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";

import { useBoolean } from "../../ui/React/hooks";
import { KEY } from "../../utils/helpers/keyCodes";

type RunScriptButtonProps = Omit<ButtonProps, "onClick" | "children" | "ref"> & {
  onRun: (args: string) => void;
};

export const RunScriptButton = ({ onRun, ...buttonProps }: RunScriptButtonProps): ReactElement => {
  const [args, setArgs] = React.useState("");
  const [isArgsPopupOpen, { on: openArgsPopup, off: hideArgsPopup }] = useBoolean(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onClick = () => {
    setArgs("");
    openArgsPopup();
  };

  const onTextFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === KEY.ENTER) {
      hideArgsPopup();
      onRun(args);
      setArgs("");
    } else if (e.key === KEY.ESC) {
      hideArgsPopup();
    }
  };

  return (
    <>
      <Button {...buttonProps} ref={buttonRef} onClick={onClick}>
        Run
      </Button>
      <Popper open={isArgsPopupOpen} placement="top" anchorEl={buttonRef.current}>
        <ClickAwayListener onClickAway={hideArgsPopup}>
          <Paper sx={{ m: 1, p: 2, width: 450 }}>
            <TextField
              value={args}
              onChange={(e) => setArgs(e.currentTarget.value)}
              placeholder="Please enter script arguments and hit Enter"
              autoFocus
              fullWidth
              onKeyDown={onTextFieldKeyDown}
              sx={{ pl: 1, pr: 1 }}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
