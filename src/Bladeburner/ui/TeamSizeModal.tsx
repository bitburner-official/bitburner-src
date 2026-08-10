import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation } from "../Actions/BlackOperation";
import type { Operation } from "../Actions/Operation";

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
  const [teamSize, setTeamSize] = useState(0);

  function confirmTeamSize(event: React.FormEvent): void {
    // Prevent reloading page when submitting form
    event.preventDefault();
    if (!Number.isInteger(teamSize) || teamSize < 0) {
      dialogBoxCreate("Invalid value entered for number of Team Members (must be a non-negative integer)");
      return;
    }
    action.teamCount = teamSize;
    onClose();
  }

  function onTeamSize(event: React.ChangeEvent<HTMLInputElement>): void {
    const newTeamSize = Number(event.target.value);
    if (newTeamSize > bladeburner.teamSize) {
      setTeamSize(bladeburner.teamSize);
    } else {
      setTeamSize(newTeamSize);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={confirmTeamSize}>
        <Typography>
          Enter the number of team members you want to take on this Op. If you don't have that many team members, then
          all your team members will be used.
          <br />
          <br />
          Team members boost your success chance, but at a diminishing rate the more you bring along.
          <br />
          <br />
          Note that some team members are likely to be lost on each operation, even if you're successful.
        </Typography>
        <TextField autoFocus type="number" placeholder="Team size" value={teamSize} onChange={onTeamSize} />
        <Button sx={{ mx: 2 }} type={"submit"}>
          Confirm
        </Button>
      </form>
    </Modal>
  );
}
