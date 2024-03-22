import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation, Operation } from "../Actions";

import React, { useState } from "react";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { Modal } from "../../ui/React/Modal";
import { Button, TextField, Typography } from "@mui/material";

interface TeamSizeModalProps {
  bladeburner: Bladeburner;
  action: Operation | BlackOperation;
  open: boolean;
  onClose: () => void;
}

export function TeamSizeModal({ bladeburner, action, open, onClose }: TeamSizeModalProps): React.ReactElement {
  const [teamSize, setTeamSize] = useState<number | undefined>();

  function confirmTeamSize(event: React.FormEvent): void {
    // Prevent reloading page when submitting form
    event.preventDefault();
    if (teamSize === undefined) return;
    const num = Math.round(teamSize);
    if (isNaN(num) || num < 0) {
      dialogBoxCreate("Invalid value entered for number of Team Members (must be numeric and non-negative)");
    } else {
      action.teamCount = num;
    }
    onClose();
  }

  function onTeamSize(event: React.ChangeEvent<HTMLInputElement>): void {
    const x = parseFloat(event.target.value);
    if (x > bladeburner.teamSize) setTeamSize(bladeburner.teamSize);
    else setTeamSize(x);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={confirmTeamSize}>
        <Typography>
          Enter the amount of team members you would like to take on this Op. If you do not have the specified number of
          team members, then as many as possible will be used. Note that team members may be lost during operations.
        </Typography>
        <TextField autoFocus type="number" placeholder="Team size" value={teamSize} onChange={onTeamSize} />
        <Button sx={{ mx: 2 }} type={"submit"}>
          Confirm
        </Button>
      </form>
    </Modal>
  );
}
